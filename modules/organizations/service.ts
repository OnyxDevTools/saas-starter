// filename: modules/organizations/service.ts
import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { ensure } from "../../lib/errors";
import { exclusively } from "../../lib/locks";
import { collect, type Store } from "../../lib/onyx/store";
import { effectivePlan, plans } from "../billing/plans";
import { organizationInput, roleSchema, type Actor } from "../models";
import { permit, protectLastOwner, type Permission } from "./permissions";
export const membershipId = (organizationId: string, userId: string) =>
  createHash("sha256").update(`${organizationId}:${userId}`).digest("hex");
export function stableId(namespace: string, value: string) {
  const h = createHash("sha256").update(`${namespace}:${value}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
export function verified(actor: Actor) {
  ensure(
    actor.uid &&
      actor.emailVerified &&
      z.email().safeParse(actor.email).success,
    403,
    "Verify your application email before continuing.",
  );
}
export class Organizations {
  constructor(public readonly store: Store) {}
  async profile(actor: Actor) {
    verified(actor);
    const now = new Date().toISOString(),
      existing = await this.store.get("Profile", actor.uid);
    if (!existing) {
      const row = {
        id: actor.uid,
        email: actor.email.toLowerCase(),
        name: actor.name || actor.email,
        createdAt: now,
        updatedAt: now,
      };
      try {
        await this.store.insert("Profile", row);
        return row;
      } catch (error) {
        const winner = await this.store.get("Profile", actor.uid);
        if (winner) return winner;
        throw error;
      }
    }
    return existing;
  }
  async account(actor: Actor, name: string) {
    verified(actor);
    const profile = await this.profile(actor);
    await this.store.update("Profile", {
      ...profile,
      name: z.string().trim().min(1).max(80).parse(name),
      email: actor.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
    });
  }
  async list(actor: Actor) {
    verified(actor);
    const memberships = await collect(this.store, "Membership", {
      userId: actor.uid,
      status: "active",
    });
    return Promise.all(
      memberships.map(async (membership) => {
        const organization = await this.store.get(
          "Organization",
          membership.organizationId,
        );
        ensure(organization, 404, "Organization unavailable.");
        return { organization, membership };
      }),
    );
  }
  async access(
    actor: Actor,
    organizationId: string,
    permission: Permission = "read",
  ) {
    verified(actor);
    const membership = await this.store.get(
      "Membership",
      membershipId(organizationId, actor.uid),
    );
    ensure(
      membership &&
        membership.organizationId === organizationId &&
        membership.userId === actor.uid &&
        membership.status === "active",
      403,
      "You do not belong to this organization.",
    );
    permit(membership.role, permission);
    const organization = await this.store.get("Organization", organizationId);
    ensure(organization, 404, "Organization unavailable.");
    return { organization, membership };
  }
  async locked<T>(
    actor: Actor,
    organizationId: string,
    permission: Permission,
    operation: string,
    work: () => Promise<T>,
  ) {
    await this.access(actor, organizationId, permission);
    return exclusively(
      this.store,
      `organization:${organizationId}`,
      operation,
      async () => {
        await this.access(actor, organizationId, permission);
        return work();
      },
    );
  }
  async audit(
    actor: Actor,
    organizationId: string,
    action: string,
    subjectId: string,
  ) {
    await this.store.insert("AuditEvent", {
      id: randomUUID(),
      organizationId,
      actorId: actor.uid,
      actorName: actor.name || actor.email,
      action,
      subjectId,
      createdAt: new Date().toISOString(),
    });
  }
  async create(actor: Actor, raw: unknown) {
    verified(actor);
    const input = organizationInput.parse(raw),
      id = stableId(actor.uid, input.requestId);
    return exclusively(
      this.store,
      `user:${actor.uid}`,
      "create-organization",
      async () => {
        await this.profile(actor);
        const now = new Date().toISOString(),
          existing = await this.store.get("Organization", id);
        if (existing)
          ensure(
            existing.createdBy === actor.uid,
            403,
            "Organization identifier unavailable.",
          );
        else
          await this.store.insert("Organization", {
            id,
            name: input.name,
            createdBy: actor.uid,
            createdAt: now,
            updatedAt: now,
          });
        const mid = membershipId(id, actor.uid),
          member = await this.store.get("Membership", mid);
        if (!member)
          await this.store.insert("Membership", {
            id: mid,
            organizationId: id,
            userId: actor.uid,
            email: actor.email.toLowerCase(),
            name: actor.name,
            role: "owner",
            status: "active",
            createdAt: now,
            updatedAt: now,
          });
        else
          ensure(
            member.status === "active" && member.role === "owner",
            409,
            "This creation request was already used. Start a new request.",
          );
        if (!existing) await this.audit(actor, id, "organization.created", id);
        return id;
      },
    );
  }
  async rename(actor: Actor, organizationId: string, name: string) {
    const valid = z.string().trim().min(2).max(80).parse(name);
    return this.locked(
      actor,
      organizationId,
      "organization",
      "rename-organization",
      async () => {
        const { organization } = await this.access(
          actor,
          organizationId,
          "organization",
        );
        await this.store.update("Organization", {
          ...organization,
          name: valid,
          updatedAt: new Date().toISOString(),
        });
        await this.audit(
          actor,
          organizationId,
          "organization.updated",
          organizationId,
        );
      },
    );
  }
  async usage(actor: Actor, organizationId: string) {
    await this.access(actor, organizationId);
    return this.readUsage(organizationId);
  }
  async invitationUsage(actor: Actor, invitationId: string, token: string) {
    verified(actor);
    const invitation = await this.store.get("Invitation", invitationId);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    ensure(
      invitation &&
        invitation.email === actor.email.toLowerCase() &&
        invitation.status === "pending" &&
        Date.parse(invitation.expiresAt) > Date.now() &&
        invitation.tokenHash === tokenHash,
      403,
      "Invitation access denied.",
    );
    return this.readUsage(invitation.organizationId);
  }
  private async readUsage(organizationId: string) {
    const [members, invites, projects, subscription] = await Promise.all([
      collect(this.store, "Membership", { organizationId, status: "active" }),
      collect(this.store, "Invitation", { organizationId, status: "pending" }),
      collect(this.store, "Project", { organizationId, status: "active" }),
      this.store.get("Subscription", organizationId),
    ]);
    const pending = invites.filter(
        (invite) => Date.parse(invite.expiresAt) > Date.now(),
      ).length,
      plan = effectivePlan(subscription),
      limits = plans()[plan];
    return {
      members: members.length,
      pending,
      seats: members.length + pending,
      projects: projects.length,
      plan,
      limits,
      subscription,
    };
  }
  async snapshot(actor: Actor, organizationId: string) {
    const access = await this.access(actor, organizationId);
    const [usage, events] = await Promise.all([
      this.usage(actor, organizationId),
      collect(this.store, "AuditEvent", { organizationId }),
    ]);
    return {
      ...access,
      usage,
      events: events
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 100),
    };
  }
  async team(actor: Actor, organizationId: string) {
    await this.access(actor, organizationId);
    return collect(this.store, "Membership", {
      organizationId,
      status: "active",
    });
  }
  async changeMember(
    actor: Actor,
    organizationId: string,
    userId: string,
    newRole: unknown,
  ) {
    const targetRole = z
      .enum(["owner", "admin", "member", "removed"])
      .parse(newRole);
    return this.locked(
      actor,
      organizationId,
      "read",
      "change-membership",
      async () => {
        const { membership: acting } = await this.access(actor, organizationId);
        const target = await this.store.get(
          "Membership",
          membershipId(organizationId, userId),
        );
        ensure(
          target &&
            target.organizationId === organizationId &&
            target.status === "active",
          404,
          "Member not found.",
        );
        if (userId === actor.uid && targetRole === "removed") {
          /* Every member may leave, subject to last-owner protection. */
        } else {
          permit(acting.role, "team");
          if (target.role === "owner" || targetRole === "owner")
            permit(acting.role, "owners");
          if (acting.role === "admin")
            ensure(
              target.role === "member" && targetRole !== "admin",
              403,
              "Only owners may change administrators.",
            );
        }
        const owners = await collect(this.store, "Membership", {
          organizationId,
          status: "active",
          role: "owner",
        });
        protectLastOwner(owners.length, target.role, targetRole);
        const now = new Date().toISOString();
        await this.store.update("Membership", {
          ...target,
          role:
            targetRole === "removed"
              ? target.role
              : roleSchema.parse(targetRole),
          status: targetRole === "removed" ? "removed" : "active",
          updatedAt: now,
        });
        await this.audit(
          actor,
          organizationId,
          targetRole === "removed" ? "member.removed" : "member.role-changed",
          userId,
        );
      },
    );
  }
  async requireAvailableSeat(actor: Actor, organizationId: string) {
    const usage = await this.usage(actor, organizationId);
    ensure(
      usage.seats < usage.limits.seats,
      409,
      `The ${usage.limits.name} plan has no available seats. Pending unexpired invitations count toward the limit.`,
    );
  }
}

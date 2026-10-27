// filename: modules/organizations/invitations.ts
import "server-only";
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import { ensure } from "../../lib/errors";
import { exclusively } from "../../lib/locks";
import { collect } from "../../lib/onyx/store";
import { invitationInput, type Actor } from "../models";
import { Notifications } from "../notifications/service";
import { membershipId, Organizations, verified } from "./service";
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export class Invitations {
  constructor(
    private readonly organizations: Organizations,
    private readonly notifications: Notifications,
  ) {}
  async list(actor: Actor, organizationId: string) {
    await this.organizations.access(actor, organizationId, "team");
    return (
      await collect(this.organizations.store, "Invitation", { organizationId })
    ).map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      email: row.email,
      role: row.role,
      status: row.status,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    }));
  }
  async create(actor: Actor, organizationId: string, raw: unknown) {
    const input = invitationInput.parse(raw),
      token = randomBytes(32).toString("base64url"),
      now = new Date().toISOString();
    return this.organizations.locked(
      actor,
      organizationId,
      "team",
      "create-invitation",
      async () => {
        const { membership } = await this.organizations.access(
          actor,
          organizationId,
          "team",
        );
        if (input.role === "admin")
          ensure(
            membership.role === "owner",
            403,
            "Only owners may invite administrators.",
          );
        const [pending, members] = await Promise.all([
          collect(this.organizations.store, "Invitation", {
            organizationId,
            email: input.email,
            status: "pending",
          }),
          collect(this.organizations.store, "Membership", {
            organizationId,
            email: input.email,
            status: "active",
          }),
        ]);
        ensure(
          !members.length &&
            !pending.some((row) => Date.parse(row.expiresAt) > Date.now()),
          409,
          "This email already belongs to the team or has a pending invitation.",
        );
        await this.organizations.requireAvailableSeat(actor, organizationId);
        const invitation = {
          id: randomUUID(),
          organizationId,
          ...input,
          tokenHash: hash(token),
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          status: "pending" as const,
          acceptedBy: "",
          createdBy: actor.uid,
          createdAt: now,
          updatedAt: now,
        };
        const notification = this.notifications.prepare(invitation, token); // Validate encryption before any write.
        await this.organizations.store.insert("Invitation", invitation);
        await this.organizations.store.insert("Notification", notification);
        await this.organizations.audit(
          actor,
          organizationId,
          "invitation.created",
          invitation.id,
        );
        return invitation.id;
      },
    );
  }
  async revoke(actor: Actor, organizationId: string, id: string) {
    return this.organizations.locked(
      actor,
      organizationId,
      "team",
      "revoke-invitation",
      async () => {
        const row = await this.organizations.store.get("Invitation", id);
        ensure(
          row && row.organizationId === organizationId,
          404,
          "Invitation not found.",
        );
        ensure(
          row.status !== "accepted",
          409,
          "This invitation was accepted. Manage the membership instead.",
        );
        if (row.status === "revoked") return;
        await this.organizations.store.update("Invitation", {
          ...row,
          status: "revoked",
          updatedAt: new Date().toISOString(),
        });
        const notification = await this.organizations.store.get(
          "Notification",
          id,
        );
        if (notification)
          await this.organizations.store.update("Notification", {
            ...notification,
            encryptedToken: "",
            updatedAt: new Date().toISOString(),
          });
        await this.organizations.audit(
          actor,
          organizationId,
          "invitation.revoked",
          id,
        );
      },
    );
  }
  async review(actor: Actor, id: string, token: string) {
    verified(actor);
    ensure(
      z.string().min(32).max(100).safeParse(token).success,
      404,
      "Invitation unavailable.",
    );
    const row = await this.organizations.store.get("Invitation", id);
    ensure(row, 404, "Invitation unavailable.");
    const supplied = Buffer.from(hash(token), "hex"),
      stored = Buffer.from(row.tokenHash, "hex");
    ensure(
      supplied.length === stored.length && timingSafeEqual(supplied, stored),
      404,
      "Invitation unavailable.",
    );
    ensure(
      row.email === actor.email.toLowerCase(),
      403,
      "Sign in with the verified email address this invitation was sent to.",
    );
    ensure(row.status !== "revoked", 410, "This invitation was revoked.");
    if (row.status === "pending")
      ensure(
        Date.parse(row.expiresAt) > Date.now(),
        410,
        "This invitation has expired.",
      );
    return row;
  }
  async accept(actor: Actor, id: string, token: string) {
    const preview = await this.review(actor, id, token);
    return exclusively(
      this.organizations.store,
      `organization:${preview.organizationId}`,
      "accept-invitation",
      async () => {
        const row = await this.review(actor, id, token),
          mid = membershipId(row.organizationId, actor.uid),
          existing = await this.organizations.store.get("Membership", mid);
        if (row.status === "accepted") {
          ensure(
            row.acceptedBy === actor.uid && existing?.status === "active",
            410,
            "This invitation was already consumed.",
          );
          return row.organizationId;
        }
        const usage = await this.organizations.invitationUsage(
          actor,
          row.id,
          token,
        );
        ensure(
          usage.seats <= usage.limits.seats,
          409,
          "This organization is over its seat limit. Ask an owner to review billing.",
        );
        await this.organizations.profile(actor);
        const now = new Date().toISOString();
        if (!existing)
          await this.organizations.store.insert("Membership", {
            id: mid,
            organizationId: row.organizationId,
            userId: actor.uid,
            email: row.email,
            name: actor.name,
            role: row.role,
            status: "active",
            createdAt: now,
            updatedAt: now,
          });
        else if (existing.status !== "active")
          await this.organizations.store.update("Membership", {
            ...existing,
            role: row.role,
            status: "active",
            updatedAt: now,
          });
        await this.organizations.store.update("Invitation", {
          ...row,
          status: "accepted",
          acceptedBy: actor.uid,
          updatedAt: now,
        });
        const notification = await this.organizations.store.get(
          "Notification",
          id,
        );
        if (notification)
          await this.organizations.store.update("Notification", {
            ...notification,
            encryptedToken: "",
            updatedAt: now,
          });
        await this.organizations.audit(
          actor,
          row.organizationId,
          "invitation.accepted",
          id,
        );
        return row.organizationId;
      },
    );
  }
}

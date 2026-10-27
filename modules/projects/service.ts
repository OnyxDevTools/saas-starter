// filename: modules/projects/service.ts
import "server-only";
import { z } from "zod";
import { ensure } from "../../lib/errors";
import { collect } from "../../lib/onyx/store";
import { projectInput, type Actor } from "../models";
import { Organizations, stableId } from "../organizations/service";
export class Projects {
  constructor(private readonly organizations: Organizations) {}
  async list(actor: Actor, organizationId: string) {
    await this.organizations.access(actor, organizationId);
    return (
      await collect(this.organizations.store, "Project", { organizationId })
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async create(
    actor: Actor,
    organizationId: string,
    raw: unknown,
    requestId: string,
  ) {
    const input = projectInput.parse(raw),
      id = stableId(organizationId, z.uuid().parse(requestId));
    return this.organizations.locked(
      actor,
      organizationId,
      "project",
      "create-project",
      async () => {
        const existing = await this.organizations.store.get("Project", id);
        if (existing) {
          ensure(
            existing.organizationId === organizationId &&
              existing.createdBy === actor.uid,
            403,
            "Project identifier unavailable.",
          );
          return id;
        }
        const usage = await this.organizations.usage(actor, organizationId);
        ensure(
          usage.projects < usage.limits.projects,
          409,
          `The ${usage.limits.name} plan allows ${usage.limits.projects} active projects. Archive one or change plans.`,
        );
        const now = new Date().toISOString();
        await this.organizations.store.insert("Project", {
          id,
          organizationId,
          ...input,
          status: "active",
          createdBy: actor.uid,
          createdAt: now,
          updatedAt: now,
        });
        await this.organizations.audit(
          actor,
          organizationId,
          "project.created",
          id,
        );
        return id;
      },
    );
  }
  async update(
    actor: Actor,
    organizationId: string,
    id: string,
    raw: unknown,
    archive = false,
  ) {
    const input = projectInput.parse(raw);
    return this.organizations.locked(
      actor,
      organizationId,
      "project",
      "update-project",
      async () => {
        const project = await this.organizations.store.get("Project", id);
        ensure(
          project && project.organizationId === organizationId,
          404,
          "Project not found in this organization.",
        );
        await this.organizations.store.update("Project", {
          ...project,
          ...input,
          status: archive ? "archived" : project.status,
          updatedAt: new Date().toISOString(),
        });
        await this.organizations.audit(
          actor,
          organizationId,
          archive ? "project.archived" : "project.updated",
          id,
        );
      },
    );
  }
}

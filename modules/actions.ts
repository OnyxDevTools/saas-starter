"use server";
// filename: modules/actions.ts
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentActor } from "./auth/session";
import { ensure, safeMessage } from "../lib/errors";
import { services } from "./services";
const string = z.string().min(1).max(256);
export async function mutate(
  operation: string,
  organizationId: string,
  input: unknown,
): Promise<{ ok: boolean; error?: string; destination?: string }> {
  try {
    const origin = (await headers()).get("origin");
    ensure(
      process.env.APP_ORIGIN && origin === process.env.APP_ORIGIN,
      403,
      "Same-origin actions are required.",
    );
    const actor = await currentActor();
    ensure(actor, 401, "Sign in to continue.");
    ensure(actor.emailVerified, 403, "Verify your email to continue.");
    const s = services();
    let destination: string | undefined;
    if (
      operation !== "organization.create" &&
      operation !== "profile.update" &&
      operation !== "invitation.accept"
    )
      z.uuid().parse(organizationId);
    switch (operation) {
      case "organization.create": {
        const id = await s.organizations.create(actor, input);
        destination = `/app/${id}`;
        break;
      }
      case "organization.rename": {
        const v = z.object({ name: z.string() }).strict().parse(input);
        await s.organizations.rename(actor, organizationId, v.name);
        break;
      }
      case "profile.update": {
        const v = z.object({ name: z.string() }).strict().parse(input);
        await s.organizations.account(actor, v.name);
        break;
      }
      case "project.create": {
        const v = z
          .object({
            name: z.string(),
            description: z.string(),
            requestId: z.uuid(),
          })
          .strict()
          .parse(input);
        await s.projects.create(
          actor,
          organizationId,
          { name: v.name, description: v.description },
          v.requestId,
        );
        break;
      }
      case "project.update":
      case "project.archive": {
        const v = z
          .object({ id: string, name: z.string(), description: z.string() })
          .strict()
          .parse(input);
        await s.projects.update(
          actor,
          organizationId,
          v.id,
          { name: v.name, description: v.description },
          operation === "project.archive",
        );
        break;
      }
      case "member.change": {
        const v = z
          .object({
            userId: string,
            role: z.enum(["owner", "admin", "member", "removed"]),
          })
          .strict()
          .parse(input);
        await s.organizations.changeMember(
          actor,
          organizationId,
          v.userId,
          v.role,
        );
        if (v.userId === actor.uid && v.role === "removed")
          destination = "/app";
        break;
      }
      case "invitation.create": {
        await s.invitations.create(actor, organizationId, input);
        break;
      }
      case "invitation.revoke": {
        const v = z.object({ id: string }).strict().parse(input);
        await s.invitations.revoke(actor, organizationId, v.id);
        break;
      }
      case "invitation.accept": {
        const v = z
          .object({ id: string, token: z.string().min(32).max(100) })
          .strict()
          .parse(input);
        const id = await s.invitations.accept(actor, v.id, v.token);
        destination = `/app/${id}`;
        break;
      }
      case "billing.demo": {
        const v = z
          .object({ plan: z.enum(["free", "team"]) })
          .strict()
          .parse(input);
        await s.billing.demo(actor, organizationId, v.plan);
        break;
      }
      case "billing.checkout":
        destination = await s.billing.checkout(actor, organizationId);
        break;
      case "billing.portal":
        destination = await s.billing.portal(actor, organizationId);
        break;
      case "billing.retry": {
        const v = z.object({ id: string }).strict().parse(input);
        const ok = await s.billing.retry(actor, organizationId, v.id);
        ensure(
          ok,
          503,
          "Reconciliation failed. The attempt was preserved for another retry.",
        );
        break;
      }
      case "billing.reconcile":
        await s.billing.reconcile(actor, organizationId);
        break;
      case "notification.send": {
        const v = z.object({ id: string }).strict().parse(input);
        const sent = await s.notifications.deliver(actor, organizationId, v.id);
        ensure(
          sent,
          503,
          "SMTP delivery failed. The notification is preserved for recovery.",
        );
        break;
      }
      default:
        ensure(false, 400, "Unknown operation.");
    }
    revalidatePath("/app", "layout");
    revalidatePath("/onboarding");
    return { ok: true, ...(destination ? { destination } : {}) };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof z.ZodError
          ? "Check the form values and try again."
          : safeMessage(error),
    };
  }
}

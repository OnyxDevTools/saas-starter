// filename: app/app/[organizationId]/outbox/page.tsx
import Link from "next/link";
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { ActionButton } from "@/components/saas/action-form";
export default async function Outbox({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor(),
    notifications = await services().notifications.outbox(
      actor,
      organizationId,
    );
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">A thoughtful invitation.</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Authenticated organization outbox. Preview and share invitations
          without sending email.
        </p>
      </header>
      <section className="bg-card border-border divide-border divide-y rounded-xl border px-6">
        {notifications.map((item) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 py-5"
          >
            <div>
              <h2 className="text-sm font-medium">{item.recipient}</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {item.channel} · {item.status} · {item.attempts} delivery
                attempt(s)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/app/${organizationId}/outbox/${item.id}`}
                className="text-primary text-sm underline"
              >
                Review invitation
              </Link>
              {process.env.MAIL_MODE === "smtp" && item.status !== "sent" && (
                <ActionButton
                  operation="notification.send"
                  organizationId={organizationId}
                  input={{ id: item.id }}
                >
                  Send via SMTP
                </ActionButton>
              )}
            </div>
          </article>
        ))}
        {!notifications.length && (
          <p className="text-muted-foreground py-12 text-sm">
            No invitations in the outbox yet. Create one from Team.
          </p>
        )}
      </section>
    </>
  );
}

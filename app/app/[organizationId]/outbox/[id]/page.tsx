// filename: app/app/[organizationId]/outbox/[id]/page.tsx
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { attempt } from "@/lib/errors";
export default async function InvitationPreview({
  params,
}: {
  params: Promise<{ organizationId: string; id: string }>;
}) {
  const { organizationId, id } = await params,
    actor = await requireActor();
  const result = await attempt(() =>
    services().notifications.preview(actor, organizationId, id),
  );
  if (result.error)
    return (
      <div role="status">
        <h1 className="text-2xl font-semibold">Invitation unavailable</h1>
        <p className="text-muted-foreground mt-4">{result.error.message}</p>
      </div>
    );
  const preview = result.data;
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">Invitation preview</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          For {preview.notification.recipient}. This link works only for that
          verified application email.
        </p>
      </header>
      <div className="bg-card border-border space-y-4 rounded-xl border p-6">
        <a
          href={preview.url}
          className="text-primary inline-block text-sm underline"
        >
          Open invitation
        </a>
        <p className="text-muted-foreground text-xs break-all">{preview.url}</p>
      </div>
      <iframe
        title="Invitation email preview"
        srcDoc={preview.html}
        sandbox=""
        className="border-border h-[34rem] w-full rounded-xl border bg-white"
      />
    </>
  );
}

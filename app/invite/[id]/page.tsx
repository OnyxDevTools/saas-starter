// filename: app/invite/[id]/page.tsx
import { redirect } from "next/navigation";
import { currentActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { PublicShell } from "@/components/saas/public-shell";
import { ActionButton } from "@/components/saas/action-form";
import { attempt } from "@/lib/errors";
export const dynamic = "force-dynamic";
export default async function AcceptInvitation({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params,
    { token } = await searchParams,
    actor = await currentActor();
  if (!actor)
    redirect(
      `/sign-in?next=${encodeURIComponent(`/invite/${id}?token=${token || ""}`)}`,
    );
  const result = await attempt(() =>
    services().invitations.review(actor, id, token || ""),
  );
  if (result.error)
    return (
      <PublicShell>
        <main className="mx-auto max-w-lg space-y-4 py-20">
          <h1 className="text-3xl font-semibold">Invitation unavailable</h1>
          <p className="text-muted-foreground">{result.error.message}</p>
        </main>
      </PublicShell>
    );
  const row = result.data;
  return (
    <PublicShell>
      <main className="mx-auto max-w-lg space-y-6 py-20">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          An invitation to join
        </p>
        <h1 className="text-3xl font-semibold">There’s a place for you.</h1>
        <p className="text-muted-foreground leading-7">
          Accept this invitation as {row.email}. You’ll join the organization as
          a {row.role}.
        </p>
        <ActionButton
          operation="invitation.accept"
          input={{ id, token }}
          variant="default"
        >
          {row.status === "accepted"
            ? "Continue to organization"
            : "Accept invitation"}
        </ActionButton>
      </main>
    </PublicShell>
  );
}

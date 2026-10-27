// filename: app/onboarding/page.tsx
import { requireActor } from "@/modules/auth/session";
import { PublicShell } from "@/components/saas/public-shell";
import { NameForm } from "@/components/saas/action-form";
export const dynamic = "force-dynamic";
export default async function Onboarding() {
  await requireActor();
  return (
    <PublicShell>
      <main className="mx-auto max-w-lg space-y-7 py-20">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          Your first shared space
        </p>
        <h1 className="text-3xl font-semibold">
          What should we call your organization?
        </h1>
        <p className="text-muted-foreground leading-7">
          Start with a name. You can invite your people and add projects once
          you’re inside.
        </p>
        <NameForm
          operation="organization.create"
          label="Organization name"
          button="Create organization"
        />
      </main>
    </PublicShell>
  );
}

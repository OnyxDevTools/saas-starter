// filename: app/app/[organizationId]/settings/page.tsx
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { NameForm } from "@/components/saas/action-form";
export default async function Settings({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor(),
    s = services(),
    access = await s.organizations.access(actor, organizationId),
    profile = await s.organizations.store.get("Profile", actor.uid);
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">Make this space yours.</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          A few details that keep your workspace feeling right.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-card border-border space-y-5 rounded-xl border p-6">
          <h2 className="font-semibold">Your account</h2>
          <p className="text-muted-foreground text-sm">
            {actor.email} · verified application email
          </p>
          <NameForm
            operation="profile.update"
            label="Display name"
            initialName={profile?.name || actor.name}
          />
        </section>
        <section className="bg-card border-border space-y-5 rounded-xl border p-6">
          <h2 className="font-semibold">Organization</h2>
          {access.membership.role !== "member" ? (
            <NameForm
              operation="organization.rename"
              organizationId={organizationId}
              label="Organization name"
              initialName={access.organization.name}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              An administrator or owner can change organization details.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

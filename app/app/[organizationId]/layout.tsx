// filename: app/app/[organizationId]/layout.tsx
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { attempt } from "@/lib/errors";
import { SetupGuidance } from "@/components/saas/setup";
import { WorkspaceShell } from "@/components/saas/workspace-shell";
export default async function OrganizationLayout({
  params,
  children,
}: {
  params: Promise<{ organizationId: string }>;
  children: React.ReactNode;
}) {
  const { organizationId } = await params,
    actor = await requireActor();
  const result = await attempt(async () => {
    const s = services();
    const access = await s.organizations.access(actor, organizationId);
    const organizations = await s.organizations.list(actor);
    return { access, organizations };
  });
  if (result.error) return <SetupGuidance message={result.error.message} />;
  return (
    <WorkspaceShell
      organization={result.data.access.organization}
      role={result.data.access.membership.role}
      organizations={result.data.organizations.map((row) => row.organization)}
    >
      {children}
    </WorkspaceShell>
  );
}

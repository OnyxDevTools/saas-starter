// filename: app/app/[organizationId]/projects/page.tsx
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { ProjectsTable } from "@/components/saas/projects-table";
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor();
  const projects = await services().projects.list(actor, organizationId);
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          A shared view of the work that matters.
        </p>
      </header>
      <ProjectsTable organizationId={organizationId} projects={projects} />
    </>
  );
}

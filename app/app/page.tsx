// filename: app/app/page.tsx
import { redirect } from "next/navigation";
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { AppError } from "@/lib/errors";
import { SetupGuidance } from "@/components/saas/setup";
export default async function AppIndex() {
  const actor = await requireActor();
  try {
    const organizations = await services().organizations.list(actor);
    if (!organizations.length) redirect("/onboarding");
    redirect(`/app/${organizations[0]!.organization.id}`);
  } catch (error) {
    if (error instanceof AppError && error.status === 503)
      return <SetupGuidance message={error.message} />;
    throw error;
  }
}

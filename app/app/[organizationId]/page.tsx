// filename: app/app/[organizationId]/page.tsx
import Link from "next/link";
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { ActivityChart } from "@/components/saas/activity-chart";
import { Button } from "@/components/ui/button";
export default async function Dashboard({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor();
  const data = await services().organizations.snapshot(actor, organizationId);
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: key.slice(5),
      events: data.events.filter((event) => event.createdAt.startsWith(key))
        .length,
    };
  });
  return (
    <div className="min-w-0 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Your shared space
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            A clear view of what’s moving.
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Welcome to {data.organization.name}. Here’s where things stand.
          </p>
        </div>
        <Button asChild>
          <Link href={`/app/${organizationId}/projects`}>Open projects</Link>
        </Button>
      </header>
      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Workspace usage"
      >
        {[
          [
            "Active projects",
            `${data.usage.projects} / ${data.usage.limits.projects}`,
          ],
          ["Seats in use", `${data.usage.seats} / ${data.usage.limits.seats}`],
          ["Current plan", data.usage.limits.name],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-card border-border rounded-xl border p-6"
          >
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="bg-card border-border min-w-0 rounded-xl border p-6 lg:col-span-3">
          <h2 className="mb-5 font-semibold">A week of momentum</h2>
          <ActivityChart data={chart} />
        </section>
        <section className="bg-card border-border min-w-0 rounded-xl border p-6 lg:col-span-2">
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Recent activity</h2>
            <Link
              href={`/app/${organizationId}/activity`}
              className="text-primary text-sm"
            >
              View all
            </Link>
          </div>
          <ul className="divide-border mt-5 divide-y">
            {data.events.slice(0, 5).map((event) => (
              <li key={event.id} className="py-3 text-sm">
                <p>{event.actorName}</p>
                <p className="text-muted-foreground mt-1">
                  {event.action.replaceAll(".", " ")} ·{" "}
                  {new Date(event.createdAt).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-muted-foreground text-xs">
        {data.usage.pending} pending invitation
        {data.usage.pending === 1 ? "" : "s"} counted toward seats. Archived
        projects don’t count toward the active project limit.
      </p>
    </div>
  );
}

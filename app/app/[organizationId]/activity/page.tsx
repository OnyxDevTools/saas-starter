// filename: app/app/[organizationId]/activity/page.tsx
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
export default async function Activity({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor(),
    data = await services().organizations.snapshot(actor, organizationId);
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">The story so far.</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          The latest 100 persisted events in this organization.
        </p>
      </header>
      <section className="bg-card border-border overflow-x-auto rounded-xl border p-6">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Organization audit events</caption>
          <thead>
            <tr>
              <th scope="col" className="pb-4">
                Person
              </th>
              <th scope="col">Action</th>
              <th scope="col">Time (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => (
              <tr key={event.id} className="border-border border-t">
                <td className="py-4 pr-4">{event.actorName}</td>
                <td className="pr-4">{event.action}</td>
                <td className="text-muted-foreground whitespace-nowrap">
                  {event.createdAt.replace("T", " ").slice(0, 19)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.events.length && (
          <p className="text-muted-foreground py-8">No activity yet.</p>
        )}
      </section>
    </>
  );
}

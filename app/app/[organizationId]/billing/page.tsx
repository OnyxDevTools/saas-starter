// filename: app/app/[organizationId]/billing/page.tsx
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import {
  billingMode,
  plans,
  applicationEnvironment,
} from "@/modules/billing/plans";
import { ActionButton } from "@/components/saas/action-form";
export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor(),
    s = services(),
    data = await s.organizations.snapshot(actor, organizationId),
    mode = billingMode(),
    limits = plans(),
    search = await searchParams;
  const events =
    data.membership.role === "owner"
      ? await s.billing.events(actor, organizationId)
      : [];
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">Room to grow.</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Your plan, your usage, and a clear picture of what comes next.
        </p>
      </header>
      {mode === "demo" && (
        <p
          role="status"
          className="bg-warning/10 text-warning border-warning/20 rounded-xl border p-4 text-sm"
        >
          Demonstration billing · no charges · subscriptions are marked as
          demonstration data.{" "}
          {applicationEnvironment() === "production"
            ? "Demonstration changes are blocked in production."
            : "Use this only in development or preview."}
        </p>
      )}
      {search.checkout && (
        <p
          role="status"
          className="bg-muted text-muted-foreground rounded-lg p-4 text-sm"
        >
          Checkout returned. Paid access changes only after the server verifies
          and reconciles Stripe state.
        </p>
      )}
      <section className="bg-card border-border grid gap-6 rounded-xl border p-6 sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-sm">Current plan</p>
          <p className="mt-2 text-2xl font-semibold">
            {data.usage.limits.name}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            Provider: {data.usage.subscription?.provider || "free"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Active projects</p>
          <p className="mt-2 text-2xl font-semibold">
            {data.usage.projects} / {data.usage.limits.projects}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">
            Seats, including pending invitations
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {data.usage.seats} / {data.usage.limits.seats}
          </p>
        </div>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        {Object.entries(limits).map(([plan, limit]) => (
          <section
            key={plan}
            className="bg-card border-border space-y-4 rounded-xl border p-6"
          >
            <h2 className="text-xl font-semibold">{limit.name}</h2>
            <p className="text-muted-foreground text-sm">
              {limit.projects} active projects · {limit.seats} seats
            </p>
            {data.membership.role === "owner" && mode === "demo" && (
              <ActionButton
                operation="billing.demo"
                organizationId={organizationId}
                input={{ plan }}
                variant="default"
              >
                Use {limit.name} demonstration plan
              </ActionButton>
            )}
            {data.membership.role === "owner" &&
              mode === "stripe" &&
              plan === "team" && (
                <ActionButton
                  operation="billing.checkout"
                  organizationId={organizationId}
                  variant="default"
                >
                  Continue to Stripe Checkout
                </ActionButton>
              )}
          </section>
        ))}
      </div>
      {mode === "disabled" && (
        <p className="text-muted-foreground text-sm">
          Optional billing is not configured. Free entitlements remain enforced.
          Enable Stripe or an explicitly allowed non-production demonstration
          mode in configuration.
        </p>
      )}
      {data.membership.role === "owner" && mode === "stripe" && (
        <div className="flex flex-wrap gap-3">
          <ActionButton
            operation="billing.portal"
            organizationId={organizationId}
          >
            Open customer portal
          </ActionButton>
          <ActionButton
            operation="billing.reconcile"
            organizationId={organizationId}
          >
            Reconcile subscription
          </ActionButton>
        </div>
      )}
      {data.membership.role !== "owner" && (
        <p className="text-muted-foreground text-sm">
          Only organization owners may change billing.
        </p>
      )}
      {events.length > 0 && (
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="font-semibold">Billing event processing</h2>
          <ul className="divide-border mt-4 divide-y">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm"
              >
                <div>
                  <p>{event.type}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {event.status} · {event.attempts} attempt(s) ·{" "}
                    {event.failureCode || "No processing error"}
                  </p>
                </div>
                {event.status !== "succeeded" && (
                  <ActionButton
                    operation="billing.retry"
                    organizationId={organizationId}
                    input={{ id: event.id }}
                  >
                    Retry reconciliation
                  </ActionButton>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

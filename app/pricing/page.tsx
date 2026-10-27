// filename: app/pricing/page.tsx
import Link from "next/link";
import { PublicShell } from "@/components/saas/public-shell";
import { Button } from "@/components/ui/button";
import { plans } from "@/modules/billing/plans";
export default function Pricing() {
  const limits = plans();
  return (
    <PublicShell>
      <main className="py-16">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Space for what’s next
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            Start small. Grow thoughtfully.
          </h1>
          <p className="text-muted-foreground mt-4 leading-7">
            Illustrative plans for this starter. Prices and limits are
            configurable examples, not a live commercial offer.
          </p>
        </header>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {Object.entries(limits).map(([id, plan]) => (
            <section
              key={id}
              className="bg-card border-border space-y-6 rounded-2xl border p-8"
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-3xl font-semibold">
                {id === "free" ? "$0" : "$29"}
                <span className="text-muted-foreground text-sm font-normal">
                  {" "}
                  / month · example
                </span>
              </p>
              <ul className="text-muted-foreground space-y-3 text-sm">
                <li>{plan.projects} active projects</li>
                <li>{plan.seats} seats, including pending invitations</li>
                <li>Organization roles and activity history</li>
              </ul>
              <Button
                asChild
                className="w-full"
                variant={id === "team" ? "default" : "outline"}
              >
                <Link href="/sign-up">Choose {plan.name}</Link>
              </Button>
            </section>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}

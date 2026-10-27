// filename: app/page.tsx
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  FolderKanban,
  Users,
  Sparkles,
} from "lucide-react";
import { PublicShell } from "@/components/saas/public-shell";
import { Button } from "@/components/ui/button";
export default function Landing() {
  return (
    <PublicShell>
      <main>
        <section className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2">
          <div className="space-y-7">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              Room to do your best work
            </p>
            <h1 className="max-w-xl text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
              Good work starts
              <br />
              with a shared space.
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg leading-8">
              Bring your people, projects, and next steps together. A calm
              foundation for a team that’s going places.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start your workspace
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">Explore plans</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Start with Free. Add room as your team grows.
            </p>
          </div>
          <div className="bg-card border-border rounded-2xl border p-6 shadow-sm sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <span className="font-semibold">A little clarity, every day</span>
              <Sparkles className="text-primary size-5" aria-hidden="true" />
            </div>
            <div className="space-y-4">
              {[
                [
                  FolderKanban,
                  "Projects with a purpose",
                  "A shared view of what comes next.",
                ],
                [
                  Users,
                  "People in the right places",
                  "A team space with thoughtful permissions.",
                ],
                [
                  Check,
                  "A foundation to grow on",
                  "Simple plans, clear usage, fewer surprises.",
                ],
              ].map(([Icon, title, text]) => {
                const Glyph = Icon as typeof Check;
                return (
                  <div
                    key={String(title)}
                    className="bg-muted/40 flex gap-4 rounded-xl p-4"
                  >
                    <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <Glyph className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold">{String(title)}</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {String(text)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground mt-6 text-xs">
              Illustrative workspace overview. Your projects begin empty.
            </p>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

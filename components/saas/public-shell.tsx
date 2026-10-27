// filename: components/saas/public-shell.tsx
import Link from "next/link";
import { BrandMark } from "./brand-mark";
import project from "@/project.json";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme";
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 sm:px-8">
      <header className="border-border flex min-h-20 flex-wrap items-center justify-between gap-3 border-b py-4">
        <Link
          href="/"
          className="font-display flex items-center gap-3 text-xl font-medium"
        >
          <BrandMark />
          {project.name}
        </Link>
        <nav aria-label="Public navigation" className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground px-2 text-sm"
          >
            Pricing
          </Link>
          <ThemeToggle />
          <Button asChild size="sm" variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </nav>
      </header>
      {children}
      <footer className="text-muted-foreground border-border mt-16 border-t py-8 text-sm">
        A considered starting point for your team’s next chapter.
      </footer>
    </div>
  );
}

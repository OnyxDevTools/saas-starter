// filename: components/saas/workspace-shell.tsx
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { WorkspaceNavigation } from "./workspace-navigation";
import { ThemeToggle } from "./theme";
import { SignOut } from "./sign-out";
import type { Rows } from "@/modules/models";
export function WorkspaceShell({
  organization,
  organizations,
  role,
  children,
}: {
  organization: Rows["Organization"];
  organizations: Rows["Organization"][];
  role: string;
  children: React.ReactNode;
}) {
  const base = `/app/${organization.id}`;
  return (
    <div className="min-h-screen lg:pl-60">
      <a
        href="#workspace-content"
        className="bg-primary text-primary-foreground sr-only rounded p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden h-screen w-60 flex-col border-r p-5 lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
        <Link
          href="/app"
          className="flex items-center gap-3 py-3 font-semibold"
        >
          <BrandMark />
          <span className="font-display text-xl">Workspace</span>
        </Link>
        <p className="text-sidebar-foreground mt-7 text-xs font-semibold tracking-widest break-words uppercase">
          {organization.name}
        </p>
        <WorkspaceNavigation base={base} canManage={role !== "member"} />
        <div className="border-sidebar-border mt-auto space-y-3 border-t pt-5">
          <Link
            href="/onboarding"
            className="text-sidebar-foreground hover:text-foreground flex items-center gap-2 text-sm"
          >
            Create organization
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
          <Link
            href="/components"
            className="text-sidebar-foreground hover:text-foreground text-sm"
          >
            Component reference
          </Link>
        </div>
      </aside>
      <header className="bg-background/95 border-border sticky top-0 z-20 flex min-h-20 flex-wrap items-center justify-between gap-3 border-b px-5 backdrop-blur-sm sm:px-8">
        <details className="relative max-w-[calc(100%-9rem)] min-w-0 sm:max-w-sm">
          <summary className="hover:bg-accent bg-card border-border flex cursor-pointer list-none items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 truncate">{organization.name}</span>
            <ChevronDown
              className="text-muted-foreground size-3.5"
              aria-hidden="true"
            />
          </summary>
          <nav
            aria-label="Switch organization"
            className="bg-popover border-border absolute top-full z-30 mt-2 w-64 space-y-1 rounded-xl border p-2 shadow-lg"
          >
            {organizations.map((row) => (
              <Link
                key={row.id}
                href={`/app/${row.id}`}
                className="hover:bg-accent block rounded-lg px-3 py-2 text-sm"
              >
                {row.name}
              </Link>
            ))}
            <Link
              href="/onboarding"
              className="text-primary block rounded-lg px-3 py-2 text-sm"
            >
              New organization
            </Link>
          </nav>
        </details>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SignOut />
        </div>
        <WorkspaceNavigation base={base} canManage={role !== "member"} mobile />
      </header>
      <main
        id="workspace-content"
        className="mx-auto w-full max-w-7xl min-w-0 space-y-8 px-5 py-8 sm:px-8 sm:py-10"
      >
        {children}
      </main>
    </div>
  );
}

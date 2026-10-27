// filename: app/_reference/foundations-section.tsx
import {
  Activity,
  Bell,
  Boxes,
  Braces,
  CalendarDays,
  ClipboardList,
  Code2,
  Component,
  Feather,
  FlaskConical,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  Link2,
  type LucideIcon,
  Paintbrush,
  Plus,
  RefreshCw,
  ShieldCheck,
  Table2,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/app/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const surfaceTokens = [
  { name: "background", token: "--background", className: "bg-background" },
  { name: "card", token: "--card", className: "bg-card" },
  { name: "muted", token: "--muted", className: "bg-muted" },
  { name: "border", token: "--border", className: "bg-border" },
  { name: "foreground", token: "--foreground", className: "bg-foreground" },
  {
    name: "muted foreground",
    token: "--muted-foreground",
    className: "bg-muted-foreground",
  },
] as const;

const semanticTokens = [
  { name: "Primary", token: "--primary", className: "bg-primary" },
  { name: "Success", token: "--success", className: "bg-success" },
  { name: "Warning", token: "--warning", className: "bg-warning" },
  { name: "Destructive", token: "--destructive", className: "bg-destructive" },
] as const;

const typographySamples = [
  [
    "Page title",
    "Workspace overview",
    "text-3xl font-semibold tracking-[-0.02em]",
  ],
  ["Section", "Recent activity", "text-lg font-semibold"],
  ["Body", "Use clear labels and concise supporting text.", "text-sm"],
  [
    "Supporting",
    "Updated a few moments ago",
    "text-[13px] text-muted-foreground",
  ],
  ["Monospace", "request_01JZ8K4Q2M", "font-mono text-sm font-medium"],
] as const;

const technologyStack = [
  { name: "Next.js", role: "App Router and Node.js server", icon: LayoutGrid },
  {
    name: "React",
    role: "Component composition and interaction",
    icon: Component,
  },
  { name: "TypeScript", role: "Strict application types", icon: Braces },
  { name: "Tailwind CSS", role: "Token-driven styling", icon: Paintbrush },
  { name: "shadcn/ui", role: "Source-owned UI primitives", icon: Code2 },
  {
    name: "Radix UI",
    role: "Accessible interaction primitives",
    icon: Component,
  },
  { name: "Lucide", role: "Icon system", icon: Feather },
  { name: "TanStack Query", role: "Server-state caching", icon: RefreshCw },
  { name: "TanStack Table", role: "Headless data tables", icon: Table2 },
  {
    name: "React Hook Form",
    role: "Form state and submission",
    icon: ClipboardList,
  },
  { name: "Zod", role: "Runtime validation and schemas", icon: ShieldCheck },
  { name: "nuqs", role: "Type-safe URL search-param state", icon: Link2 },
  { name: "Zustand", role: "Shared client state (reserved)", icon: Boxes },
  { name: "sonner", role: "Toast notifications", icon: Bell },
  { name: "date-fns", role: "Dates and calendar math", icon: CalendarDays },
  { name: "t3-env", role: "Typed environment variables", icon: KeyRound },
  {
    name: "Prettier + knip",
    role: "Formatting and dead-code gates",
    icon: Wrench,
  },
  {
    name: "Playwright + axe",
    role: "Browser and accessibility tests",
    icon: FlaskConical,
  },
] as const;

function SectionHeading({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="max-w-2xl space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm leading-6">{description}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: Readonly<{ label: string; value: string; icon: LucideIcon }>) {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <div className="flex items-center justify-between gap-4">
          <CardDescription className="font-medium">{label}</CardDescription>
          <span className="bg-muted text-muted-foreground ring-border/60 flex size-8 items-center justify-center rounded-md ring-1 ring-inset">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <CardTitle className="font-mono text-3xl font-medium tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export function FoundationsSection() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Design system reference and kitchen sink of every UI primitive."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus aria-hidden="true" />
                New item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New item</DialogTitle>
                <DialogDescription>
                  Dialogs handle blocking tasks with focus management and Escape
                  to close.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="item-name">Item name</Label>
                <Input id="item-name" name="item-name" placeholder="Untitled" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Create</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Cards">
        <StatCard label="Projects" value="12" icon={FolderKanban} />
        <StatCard label="Recent activity" value="48" icon={Activity} />
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="Color tokens"
          description="Neutral surfaces provide hierarchy while semantic colors communicate action and status."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {surfaceTokens.map((token) => (
            <div key={token.name} className="space-y-2">
              <div
                className={cn(
                  "border-border h-16 rounded-md border",
                  token.className,
                )}
              />
              <p className="text-xs font-medium capitalize">{token.name}</p>
              <p className="text-muted-foreground font-mono text-xs">
                {token.token}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {semanticTokens.map((token) => (
            <div key={token.name} className="space-y-2">
              <div className={cn("h-10 rounded-md", token.className)} />
              <p className="text-xs font-medium">{token.name}</p>
              <p className="text-muted-foreground font-mono text-xs">
                {token.token}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="Typography"
          description="IBM Plex Sans handles interface hierarchy and IBM Plex Mono aligns technical values."
        />
        <div className="border-border overflow-hidden rounded-lg border">
          {typographySamples.map(([label, sample, className]) => (
            <div
              key={label}
              className="border-border grid gap-2 border-b px-4 py-4 last:border-0 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:px-6"
            >
              <p className="text-muted-foreground font-mono text-xs">{label}</p>
              <p className={className}>{sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="Technology layers"
          description="Libraries keep narrow responsibilities and reusable components own presentation."
        />
        <div className="border-border bg-border grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-3">
          {technologyStack.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="bg-card flex gap-4 p-4">
                <div className="border-border bg-muted text-primary flex size-9 shrink-0 items-center justify-center rounded-md border">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="text-muted-foreground mt-1 text-[13px] leading-5">
                    {item.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

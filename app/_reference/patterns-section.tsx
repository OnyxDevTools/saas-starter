"use client";
// filename: app/_reference/patterns-section.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { subDays } from "date-fns";
import {
  Archive,
  ArrowUpDown,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  Copy,
  Info,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { formatDisplayDate } from "@/lib/format-date";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const REQUEST_ID = "req_01JZ8K4Q2M";
const viewModes = ["cards", "compact"] as const;

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least two characters.")
    .max(50, "Use 50 characters or fewer."),
  owner: z.string().trim().email("Enter a valid email address."),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type ProjectRow = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Draft" | "Archived";
  updated: Date;
};

const showcaseDate = new Date(2026, 6, 18);

const projectRows: ProjectRow[] = [
  {
    id: "req_01JZ8K4Q2M",
    name: "Alpha",
    owner: "alex@example.com",
    status: "Active",
    updated: showcaseDate,
  },
  {
    id: "req_01JZ8K4Q2N",
    name: "Documentation",
    owner: "sam@example.com",
    status: "Draft",
    updated: subDays(showcaseDate, 1),
  },
  {
    id: "req_01JZ8K4Q2P",
    name: "Legacy import",
    owner: "jordan@example.com",
    status: "Archived",
    updated: subDays(showcaseDate, 6),
  },
];

const projectStatusClasses: Record<ProjectRow["status"], string> = {
  Active: "border-transparent bg-success/12 text-success",
  Draft: "border-transparent bg-info/12 text-info",
  Archived: "border-transparent bg-muted text-muted-foreground",
};

const projectColumns: ColumnDef<ProjectRow>[] = [
  {
    accessorKey: "id",
    header: "Request",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-3 h-7"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ArrowUpDown aria-hidden="true" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={projectStatusClasses[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "updated",
    header: () => <span className="block text-right">Updated</span>,
    cell: ({ row }) => (
      <span className="numeric text-muted-foreground block text-right text-xs">
        {formatDisplayDate(row.original.updated)}
      </span>
    ),
  },
];

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

function MenusDemo() {
  return (
    <div className="space-y-4">
      <div className="border-border/60 flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Alpha</p>
          <p className="text-muted-foreground font-mono text-xs">
            {REQUEST_ID}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Copy request ID"
                onClick={() => {
                  void navigator.clipboard.writeText(REQUEST_ID);
                  toast.success("Request ID copied");
                }}
              >
                <Copy aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy request ID</TooltipContent>
          </Tooltip>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Project actions">
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() =>
                  toast("Opened editor", { description: "Alpha" })
                }
              >
                <Pencil aria-hidden="true" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => toast.success("Project archived")}
              >
                <Archive aria-hidden="true" /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() =>
                  toast.error("Delete requires confirmation", {
                    description:
                      "Use an alert dialog for irreversible actions.",
                  })
                }
              >
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Icon-only actions get a tooltip and an accessible label. Destructive
        menu items stay last, separated, and use the destructive token.
      </p>
    </div>
  );
}

function FeedbackAndUrlDemo() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(viewModes).withDefault("cards"),
  );

  return (
    <section
      className="grid gap-4 lg:grid-cols-2"
      aria-label="Feedback and URL state"
    >
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Sonner provides non-blocking feedback for completed application
            actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Example notification sent", {
                description:
                  "Use inline feedback when the message belongs to a field.",
              })
            }
          >
            <Send aria-hidden="true" />
            Show notification
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL state</CardTitle>
          <CardDescription>
            nuqs keeps shareable view state typed and synchronized with the URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2" aria-label="Choose a view">
            <Button
              variant={view === "cards" ? "secondary" : "outline"}
              onClick={() => setView("cards")}
            >
              <LayoutGrid aria-hidden="true" />
              Cards
            </Button>
            <Button
              variant={view === "compact" ? "secondary" : "outline"}
              onClick={() => setView("compact")}
            >
              <List aria-hidden="true" />
              Compact
            </Button>
          </div>
          <p className="text-muted-foreground font-mono text-xs">
            Current value: {view}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function FormAndTableDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [submittedProjectName, setSubmittedProjectName] = useState<
    string | null
  >(null);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "New project", owner: "owner@example.com" },
  });

  // TanStack Table exposes mutable instance methods by design.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: projectRows,
    columns: projectColumns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <section className="space-y-6">
        <SectionHeading
          title="Validated form"
          description="React Hook Form and Zod provide a typed validation boundary."
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_1fr]">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              setSubmittedProjectName(values.name),
            )}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-owner">Owner email</Label>
              <Input
                id="project-owner"
                type="email"
                aria-invalid={Boolean(form.formState.errors.owner)}
                {...form.register("owner")}
              />
              {form.formState.errors.owner ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.owner.message}
                </p>
              ) : null}
            </div>
            <Button type="submit">Validate project</Button>
          </form>
          <div className="border-border bg-card flex min-h-36 items-center justify-center rounded-lg border p-4">
            {submittedProjectName ? (
              <p className="text-success flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {submittedProjectName} is valid
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Submit the form to preview validated data.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="Data table"
          description="TanStack Table supplies headless sorting; identifiers stay monospace and timestamps use date-fns."
        />
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}

export function PatternsSection() {
  return (
    <>
      <section className="grid gap-4 lg:grid-cols-2" aria-label="Patterns">
        <Card>
          <CardHeader>
            <CardTitle>Overlays</CardTitle>
            <CardDescription>
              Dialogs block, popovers anchor, sheets hold secondary workflows,
              and alert dialogs confirm destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm archive</DialogTitle>
                  <DialogDescription>
                    Archived projects are hidden from the workspace but can be
                    restored later.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>Archive</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="space-y-2">
                <p className="text-sm font-semibold">Contextual content</p>
                <p className="text-muted-foreground text-sm">
                  Popovers hold small interactive content anchored to a trigger.
                </p>
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit project</SheetTitle>
                  <SheetDescription>
                    Sheets keep secondary workflows beside the page instead of
                    replacing it.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sheet-name">Project name</Label>
                    <Input
                      id="sheet-name"
                      name="sheet-name"
                      defaultValue="Alpha"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sheet-description">Description</Label>
                    <Textarea
                      id="sheet-description"
                      name="sheet-description"
                      placeholder="Add a short description"
                    />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button>Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete project</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the project and its activity
                    history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">
                    Delete project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menus and tooltips</CardTitle>
            <CardDescription>
              Dropdown menus group row actions; tooltips explain icon-only
              controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MenusDemo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>
              Tabs switch between views of the same subject without changing
              routes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-1">
                <p className="text-sm font-medium">Alpha</p>
                <p className="text-muted-foreground text-sm">
                  A representative project detail view.
                </p>
              </TabsContent>
              <TabsContent value="activity" className="space-y-1">
                <p className="text-sm font-medium">Recent activity</p>
                <p className="text-muted-foreground text-sm">
                  Events from the last seven days appear here.
                </p>
              </TabsContent>
              <TabsContent value="access" className="space-y-1">
                <p className="text-sm font-medium">Access</p>
                <p className="text-muted-foreground text-sm">
                  Two members can view and edit this project.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loading states</CardTitle>
            <CardDescription>
              Skeletons mirror the shape of the content they replace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>
              Inline callouts pair a semantic color with an icon and text.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-2">
            <Alert>
              <Info aria-hidden="true" />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Neutral alerts carry general information without urgency.
              </AlertDescription>
            </Alert>
            <Alert variant="success">
              <CircleCheck aria-hidden="true" />
              <AlertTitle>Backup complete</AlertTitle>
              <AlertDescription>
                The workspace snapshot finished without errors.
              </AlertDescription>
            </Alert>
            <Alert variant="warning">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Storage almost full</AlertTitle>
              <AlertDescription>
                You have used 90% of the local storage quota.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Sync failed</AlertTitle>
              <AlertDescription>
                The last sync did not complete. Retry to avoid data loss.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      <FeedbackAndUrlDemo />
      <FormAndTableDemo />
    </>
  );
}

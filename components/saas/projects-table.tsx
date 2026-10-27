"use client";
// filename: components/saas/projects-table.tsx
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDownUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NameForm, ActionButton } from "./action-form";
import type { Rows } from "@/modules/models";
type Project = Rows["Project"];
export function ProjectsTable({
  organizationId,
  projects,
}: {
  organizationId: string;
  projects: Project[];
}) {
  const [sorting, setSorting] = useState<SortingState>([
      { id: "name", desc: false },
    ]),
    [filter, setFilter] = useState(""),
    [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowDownUp aria-hidden="true" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-muted-foreground mt-1 max-w-sm truncate text-xs">
            {row.original.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.status}</Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(row.original)}
          >
            Edit {row.original.name}
          </Button>
          {row.original.status === "active" && (
            <ActionButton
              operation="project.archive"
              organizationId={organizationId}
              input={{
                id: row.original.id,
                name: row.original.name,
                description: row.original.description,
              }}
              confirmText="Archive this project?"
            >
              Archive
            </ActionButton>
          )}
        </div>
      ),
    },
  ];
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table intentionally owns dynamic table callbacks; no compiler memoization is used here.
  const table = useReactTable({
    data: projects,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    getRowId: (row) => row.id,
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="project-search">Search projects</Label>
          <Input
            id="project-search"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              table.setPageIndex(0);
            }}
            placeholder="Search by name or status"
          />
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus aria-hidden="true" />
          New project
        </Button>
      </div>
      <div className="bg-card border-border overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Organization projects</caption>
          <thead className="bg-muted/50 text-muted-foreground">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    scope="col"
                    key={header.id}
                    className="px-5 py-3 font-medium"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-border hover:bg-muted/30 border-t"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!table.getRowModel().rows.length && (
          <div className="text-muted-foreground px-6 py-14 text-center text-sm">
            {filter
              ? "No projects match your search."
              : "A fresh start. Create your first project."}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {table.getFilteredRowModel().rows.length} projects · Page{" "}
          {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit project" : "New project"}
            </DialogTitle>
            <DialogDescription>
              A name and a little context are all you need to begin.
            </DialogDescription>
          </DialogHeader>
          {editing !== undefined && (
            <NameForm
              key={editing?.id || "new"}
              operation={editing ? "project.update" : "project.create"}
              organizationId={organizationId}
              label="Project name"
              description
              initialName={editing?.name || ""}
              initialDescription={editing?.description || ""}
              extra={editing ? { id: editing.id } : {}}
              button={editing ? "Save project" : "Create project"}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

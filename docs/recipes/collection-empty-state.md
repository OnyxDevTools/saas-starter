<!-- filename: docs/recipes/collection-empty-state.md -->

# Recipe: Collection empty state

## When to use

A list or collection page with no rows yet, and one clear next action.

## Constitutions

`ui-design.md`, `lucide.md`, `shadcn.md`

## Pattern

```tsx
import { FolderKanban, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { PageHeader } from "@/app/components/page-header";

export default function ProjectsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Projects"
        description="Organize your work."
        actions={
          <Button>
            <Plus aria-hidden="true" />
            New project
          </Button>
        }
      />

      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
          <div className="bg-muted text-muted-foreground ring-border flex size-12 items-center justify-center rounded-lg ring-1 ring-inset">
            <FolderKanban className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">No projects yet</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a project to start organizing your work.
            </p>
          </div>
          <Button variant="outline">Create project</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Rules

- Keep empty states concise: icon, title, one supporting line, one action.
- Prefer `outline` for the in-card action when the header already has a primary button.
- Avoid illustrations unless explicitly requested.

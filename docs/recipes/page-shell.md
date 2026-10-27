<!-- filename: docs/recipes/page-shell.md -->

# Recipe: Page shell

## When to use

Any new route under `app/(app)/` that needs a consistent header and content area.

## Constitutions

`nextjs.md`, `ui-design.md`, `react.md`

## Pattern

```tsx
import type { Metadata } from "next";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/app/components/page-header";

export const metadata = {
  title: "Projects",
} satisfies Metadata;

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

      {/* Main content */}
    </div>
  );
}
```

## Rules

- Always use `PageHeader` — do not hand-roll page titles.
- One primary action in the header when the page has a create/add flow.
- Keep the page a Server Component unless interactivity requires a child client boundary.

<!-- filename: docs/recipes/url-filtered-table.md -->

# Recipe: URL-filtered table

## When to use

A table or collection whose filters, sort, or view mode should be shareable via the URL.

## Constitutions

`nuqs.md`, `tanstack-table.md`, `react.md`, `nextjs.md`

## Pattern

```tsx
"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

const views = ["cards", "compact"] as const;

function ViewControls() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(views).withDefault("cards"),
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={view === "cards" ? "secondary" : "outline"}
        onClick={() => setView("cards")}
      >
        Cards
      </Button>
      <Button
        variant={view === "compact" ? "secondary" : "outline"}
        onClick={() => setView("compact")}
      >
        Compact
      </Button>
    </div>
  );
}

export default function FilteredCollection() {
  return (
    <Suspense>
      <ViewControls />
      {/* table or list keyed off the URL state */}
    </Suspense>
  );
}
```

## Rules

- Wrap `useQueryState` consumers in `Suspense` on statically prerendered pages.
- Keep URL state typed with nuqs parsers; do not hand-parse `useSearchParams`.
- Pair with TanStack Table for sortable structured data (see Overview
  `PatternsSection`).

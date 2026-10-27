<!-- filename: docs/constitutions/index.md -->

# Library Constitution Index

Read only the constitutions relevant to the current task.

| When working with                                                     | Read                   |
| --------------------------------------------------------------------- | ---------------------- |
| Firebase, Stripe, React Email, SMTP, Recharts and RTL                 | `saas-integrations.md` |
| Onyx Database SDK and persistence                                     | `onyx.md`              |
| Next.js routing, layouts, server components, route handlers           | `nextjs.md`            |
| React components, hooks, rendering, composition                       | `react.md`             |
| Type definitions, generics, domain models                             | `typescript.md`        |
| Styling and responsive layouts                                        | `tailwind.md`          |
| UI components copied from shadcn                                      | `shadcn.md`            |
| Dialogs, menus, popovers, accessibility primitives                    | `radix.md`             |
| Shared client-side state                                              | `zustand.md`           |
| Client API caching, polling, and mutations                            | `tanstack-query.md`    |
| Data grids and tables                                                 | `tanstack-table.md`    |
| Forms and form state                                                  | `react-hook-form.md`   |
| Runtime validation and schemas                                        | `zod.md`               |
| Environment variables and configuration                               | `t3-env.md`, `zod.md`  |
| URL-backed filters, sorting, pagination, and view state               | `nuqs.md`              |
| Application icons and icon-only actions                               | `lucide.md`            |
| Dates, times, and calendar math                                       | `date-fns.md`          |
| Toast notifications and action feedback                               | `sonner.md`            |
| Layout, visual hierarchy, dark-mode colors, spacing, page composition | `ui-design.md`         |
| End-to-end browser testing                                            | `playwright.md`        |
| Automated formatting and Tailwind class ordering                      | `prettier.md`          |
| Unused files, exports, and dependency analysis                        | `knip.md`              |
| Unit tests for `lib/` helpers                                         | `vitest.md`            |

Feature scaffolds (page shell, forms, dialogs, tables) live under
`docs/recipes/` and are indexed in `docs/recipes/index.md`.

## Multi-library tasks

Read every constitution directly involved in the implementation.

Examples:

- A validated form: `react.md`, `react-hook-form.md`, `zod.md` (+ `docs/recipes/validated-form.md`)
- A persisted global filter: `react.md`, `zustand.md`
- A sortable table: `react.md`, `tanstack-table.md`
- A shadcn dialog form: `react.md`, `shadcn.md`, `radix.md`, `react-hook-form.md`, `zod.md`
- A URL-backed filter: `react.md`, `nextjs.md`, `nuqs.md` (+ `docs/recipes/url-filtered-table.md`)
- A validated environment variable: `nextjs.md`, `t3-env.md`, `zod.md`
- Mutation completion feedback: `react.md`, `tanstack-query.md`, `sonner.md`
- A browser workflow test: `playwright.md`
- A `lib/` unit test: `vitest.md`, `typescript.md`

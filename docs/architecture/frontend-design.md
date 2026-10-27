<!-- filename: docs/architecture/frontend-design.md -->

# Frontend design

Inherited Admin Starter primitives remain data-independent. components/saas owns
application forms, shell, table, chart and setup guidance. Server Components read
initial scoped snapshots. Server Actions return safe mutation results; clients
refresh server state rather than treating browser state as authorization.

Use semantic tokens for both light/dark themes, clear hierarchy, bounded mobile
layouts, labeled controls, focus states and accessible feedback. React Hook Form
uses Zod on the client, and service validation repeats on the server. TanStack
Table owns search/sort/pagination over a bounded authorized initial dataset.
Recharts uses the shadcn ChartContainer/Tooltip/Legend components over actual
persisted audit activity, with the observation window stated.

/components is the protected, inherited primitive reference; the real SaaS
workflow lives under /app. Avoid per-feature colors and keep contrast in hovered,
focused and restored-theme states. Application data is never fabricated in UI.

The SaaS-specific theme is Parchment / Aubergine / Clay, with Manrope body text
and Lora display headings. Shared semantic sidebar tokens and aria-current
selected navigation distinguish the app shell. See STYLE_GUIDE.md.

<!-- filename: docs/constitutions/nuqs.md -->

# nuqs Constitution

## Use nuqs for

- Search, filter, sort, pagination, tab, and view state represented in the URL
- State that should survive refresh, be bookmarkable, or be shareable
- Typed coordination between search parameters and interactive controls

## Required patterns

- Mount one App Router `NuqsAdapter` in the shared provider layer.
- Use a nuqs parser for every value; never trust an arbitrary query string.
- Define explicit defaults and clear defaults from the URL when the distinction
  is not meaningful.
- Use `useQueryStates` for related parameters that update atomically.
- Use history replacement for transient refinement. Push history only when Back
  should traverse the state changes.
- Use server-side parsers when Server Components depend on the same parameters.

## Prohibited patterns

- Duplicating URL state in Zustand or component state
- Using URLs for secrets, large payloads, drafts, hover, or dialog state
- Parsing query parameters with unsafe casts
- Converting an entire page to a Client Component for one URL-backed control
- Triggering server navigation when a shallow client update is sufficient

## Ownership rule

If copying the URL should reproduce the state, prefer nuqs. If state is shared
but intentionally device-local, evaluate Zustand. If it belongs to one control,
keep it local.

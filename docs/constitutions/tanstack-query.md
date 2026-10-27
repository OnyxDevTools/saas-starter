<!-- filename: docs/constitutions/tanstack-query.md -->

# TanStack Query Constitution

## Use TanStack Query for

- Client-side server data fetching
- API response caching
- Background refetching
- Request deduplication
- Pagination and infinite queries
- Remote mutations
- Cache invalidation
- Optimistic updates

## Required patterns

- Use typed query keys.
- Keep query functions separate from components.
- Validate untrusted API responses with Zod.
- Use stable, hierarchical query keys.
- Invalidate the smallest relevant cache scope after mutations.
- Handle loading, empty, error, and success states explicitly.
- Use `enabled` only for genuine conditional dependencies.
- Use optimistic updates only when rollback behavior is reliable.
- Keep mutation side effects inside mutation lifecycle callbacks.
- Prefer server-rendered initial data when Next.js can provide it efficiently.
- Keep polling cadence explicit and proportional to the data's update rate.
- When an external runtime updates server state, invalidate only the exact query
  key that represents that runtime's result.
- Bootstrap real-time views with a validated query response, then apply
  validated stream events atomically to that exact query key. Do not mirror the
  same remote collection into component state.

## Devtools

React Query devtools are intentionally not installed or mounted because their
floating control interferes with the application interface. Do not reintroduce
the package or component unless the user explicitly changes this decision. Use
browser tooling and focused cache diagnostics when investigating query state.

## Query key pattern

```ts
const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  detail: (propertyId: string) =>
    [...propertyKeys.all, "detail", propertyId] as const,
};
```

## State ownership

- Remote server data belongs in TanStack Query.
- Shared client-owned state belongs in Zustand.
- Form state belongs in React Hook Form.
- URL-shareable filters belong in search parameters.
- Initial server-rendered data belongs in Server Components.

## Prohibited patterns

- Copying query data into Zustand
- Using query cache for local UI state
- Building query keys from unstable objects
- Calling APIs directly inside render functions
- Invalidating every query after every mutation
- Silently swallowing query or mutation errors
- Using effects to manually synchronize query data
- Optimistic updates without rollback handling
- Treating stale cached data as authorization truth
- Assuming a page-owned query or mutation loop will survive route navigation

## Polling ownership

TanStack Query owns remote data and cache refresh. A route-independent timer or
stream that must continue while another page is visible belongs to a persistent
client runtime above the route boundary. That runtime may invalidate precise
query keys after successful work; it must not copy remote response collections
into a second global client store.

A route-local live stream may update its bootstrap query directly with
`setQueryData` when each event is complete, validated, newer than the cached
field, and scoped to the exact query key. Historical snapshots may continue on
a slower query cadence; do not poll current prices when a live stream owns them.

## Mutation rules

- Validate mutation input before sending it.
- Prevent duplicate submissions when appropriate.
- Map server validation errors into structured application errors.
- Update or invalidate affected queries after success.
- Roll back optimistic changes after failure.
- Do not perform privileged authorization decisions on the client.

## Related constitutions

- `nextjs.md`
- `react.md`
- `typescript.md`
- `zod.md`
- `zustand.md`

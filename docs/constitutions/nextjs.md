<!-- filename: docs/constitutions/nextjs.md -->

# Next.js Constitution

## Use Next.js for

- Routing, layouts, pages, metadata, and application structure
- Server Components and server-side data access
- Route Handlers and Server Actions
- Caching, revalidation, and streaming
- Authentication and authorization boundaries

## Required patterns

- Use the App Router.
- Prefer Server Components by default.
- Add `'use client'` only when browser APIs, hooks, or interactivity require it.
- Keep client boundaries as low in the component tree as practical.
- Perform authorization checks on the server.
- Validate all external inputs.
- Use route groups and layouts to organize application areas.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` where appropriate.
- Keep secrets and privileged SDKs in server-only modules.
- Make caching and revalidation behavior explicit.
- Target the standard Next.js Node.js runtime for the local application.
- Use `next build` and `next start` for the standard Node.js production path.
- Keep local service integrations on the server and bind supporting processes
  to loopback interfaces.
- Proxy authenticated provider streams through a Node.js Route Handler. Keep
  provider credentials and SDK clients server-only, validate every upstream
  event, disable response buffering, and close upstream sockets when the
  downstream request is aborted.
- Place client work that must survive App Router navigation in a provider or
  layout that remains mounted above the changing route segment.

## Prohibited patterns

- Converting entire pages to Client Components for one interactive element
- Fetching server-owned data in `useEffect` by default
- Importing server-only modules into Client Components
- Trusting client-provided authorization state
- Relying on unclear caching defaults
- Duplicating routing state in Zustand
- Owning route-independent timers, streams, or job loops inside a page component
- Adding hosting, deployment, or alternate-runtime adapters without an explicit
  architecture change

## Decision rules

- Initial page data belongs in Server Components.
- Interactive client refetching belongs in TanStack Query.
- Shared client-owned state belongs in Zustand.
- URL-relevant state belongs in route parameters or search parameters.
- A route-independent client runtime may coordinate a timer or stream above the
  route boundary, while its remote results remain in TanStack Query.
- A stream needed only while one route is visible may be owned by that route's
  lowest practical Client Component; it must abort on unmount and reconnect
  deliberately after transport failure.

## Related constitutions

- `react.md`
- `typescript.md`
- `zod.md`
- `zustand.md`

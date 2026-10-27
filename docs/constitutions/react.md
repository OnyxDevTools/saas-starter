<!-- filename: docs/constitutions/react.md -->

# React Constitution

## Core principles

- Build small, cohesive components.
- Prefer composition over configuration-heavy components.
- Keep state as close to its owner as practical.
- Make data flow explicit.
- Avoid effects when rendering or event handlers can solve the problem.

## Required patterns

- Use function components.
- Use strict, explicit prop types.
- Prefer controlled component APIs for reusable components.
- Use semantic HTML before adding ARIA attributes.
- Use stable keys derived from persistent identity.
- Extract hooks only when behavior is reusable.
- Keep render functions free of side effects.
- Use memoization only when there is a demonstrated reason.
- Use transitions for non-urgent UI updates where appropriate.
- Abort in-flight requests and clear timers when a runtime owner unmounts or
  replaces its active job.

## State ownership

- Component-local state: `useState` or `useReducer`
- Shared client state: Zustand
- Form state: React Hook Form
- Remote server state: Server Components or TanStack Query
- URL state: Next.js route or search parameters

## Prohibited patterns

- Storing derived values in state
- Using array indexes as keys for reorderable data
- Calling hooks conditionally
- Using `useEffect` to mirror props into state
- Using Context as a high-frequency global store
- Creating wrapper components that add no behavior or abstraction value
- Premature `useMemo`, `useCallback`, or `memo`

## Long-running client work

- Do not place work that must survive navigation in a route component; route
  changes unmount the component and run its effect cleanup.
- Give a timer, polling loop, or stream one persistent owner above the route
  boundary. Do not duplicate the same loop in both the provider and the page.
- Persist only the minimum versioned input needed to restore an active job.
  Treat the submitted configuration as immutable for that job and render it
  when the user returns to the owning screen.
- Restore browser state after hydration and ensure deferred restoration cannot
  update an unmounted component.
- For route-local real-time displays, start the stream only after bootstrap data
  succeeds, apply events to the authoritative remote-data cache, and abort plus
  clear reconnect timers during effect cleanup.

## Related constitutions

- `nextjs.md`
- `typescript.md`
- `zustand.md`
- `react-hook-form.md`

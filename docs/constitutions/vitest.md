<!-- filename: docs/constitutions/vitest.md -->

# Vitest Constitution

## Use Vitest for

- Unit tests of framework-independent helpers under `lib/`
- Pure schema, formatting, and mapping logic
- Fast feedback without a browser

## Required patterns

- Colocate tests as `*.test.ts` next to the module under `lib/`.
- Prefer testing pure functions over React components in Vitest.
- Use the `@/` path alias consistent with application code.
- Keep tests deterministic; do not depend on network or wall-clock time unless
  the module under test owns that behavior (inject clocks when needed).
- Run unit tests through `npm run test` and include them in `npm run check`.

## Prohibited patterns

- Using Vitest for full browser workflows — use Playwright
- Snapshotting large React trees as a substitute for behavior assertions
- Testing implementation details of shadcn primitives
- Skipping failing tests without a tracked reason

## Related constitutions

- `typescript.md`
- `zod.md`
- `playwright.md`

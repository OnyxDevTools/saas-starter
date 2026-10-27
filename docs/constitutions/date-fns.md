<!-- filename: docs/constitutions/date-fns.md -->

# date-fns Constitution

## Use date-fns for

- Calendar math (add, subtract, difference, start/end of period)
- Date comparison and sorting
- Parsing non-ISO date strings
- Formatting dates and times for display
- Relative time (`formatDistanceToNow`) when the design calls for it

## Required patterns

- Import functions individually: `import { format, subDays } from "date-fns"`.
- Keep non-trivial date logic in `lib/` helpers, not inline in components.
- Prefer `formatDisplayDate` from `lib/format-date.ts` for table and list
  timestamps so display patterns stay consistent.
- Use ISO 8601 strings at system boundaries (APIs, storage) and `Date`
  objects in memory.
- Use explicit format patterns; do not rely on locale-default output for
  layout-sensitive text.
- Render relative or "current time"-dependent values in Client Components so
  they reflect the viewer's clock, not the build time.
- Display technical timestamps with the monospace numeric convention.

## Prohibited patterns

- Adding a second date library (moment, dayjs, luxon)
- Manual millisecond arithmetic for calendar math
- Storing formatted display strings in state or passing them through APIs
- Reimplementing formatting that `Intl.DateTimeFormat` or date-fns already
  provides
- Mutating `Date` objects shared across scopes

## Related constitutions

- `typescript.md`
- `react.md`

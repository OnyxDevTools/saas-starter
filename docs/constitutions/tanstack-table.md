<!-- filename: docs/constitutions/tanstack-table.md -->

# TanStack Table Constitution

## Use TanStack Table for

- Sorting
- Filtering
- Pagination
- Row selection
- Column visibility
- Grouping
- Expandable rows
- Headless table state and behavior

## Required patterns

- Keep column definitions strongly typed.
- Use stable row identifiers.
- Define `getRowId` when source identifiers are available.
- Keep data transformation outside cell renderers.
- Use controlled state when table state must sync with the URL or server.
- Use server-side sorting, filtering, and pagination for large remote datasets.
- Render semantic table markup when the content is tabular.
- Provide accessible labels for table actions.

## State ownership

- Local table state stays in the table component.
- URL-shareable filters belong in search parameters.
- Cross-page table preferences may use Zustand.
- Remote rows and loading state belong in Server Components or TanStack Query.

## Prohibited patterns

- Using array indexes as row IDs
- Fetching data inside column definitions
- Placing business mutations directly in cell renderers
- Client-side pagination over unbounded remote datasets
- Storing full table datasets in Zustand
- Recreating column definitions unnecessarily
- Using tables for non-tabular card layouts

## Related constitutions

- `react.md`
- `typescript.md`
- `zustand.md`

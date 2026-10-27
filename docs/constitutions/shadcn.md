<!-- filename: docs/constitutions/shadcn.md -->

# shadcn/ui Constitution

## Core principles

- Treat shadcn components as project-owned source code.
- Prefer existing shadcn components before creating custom primitives.
- Preserve accessibility behavior inherited from Radix.
- Keep reusable primitives separate from application-specific components.

## Required patterns

- Install components through the shadcn CLI.
- Keep base components in the project’s established UI directory.
- Use the existing `cn()` utility.
- Preserve forwarded refs where required.
- Preserve component display names where present.
- Use variants for reusable visual states.
- Keep business logic out of primitive UI components.
- Match established project tokens and styling conventions.

## Modification policy

When editing a shadcn component:

- Preserve its public API unless the task requires a change.
- Preserve keyboard behavior and focus management.
- Preserve disabled and loading behavior.
- Avoid unrelated visual changes.
- Review CLI updates before overwriting local modifications.

## Prohibited patterns

- Duplicating similar primitives across feature folders
- Removing Radix accessibility behavior
- Adding API calls or domain logic to primitives
- Replacing semantic elements with generic `div` elements
- Editing all primitives to solve one feature-specific need
- Treating shadcn as an immutable external package

## Related constitutions

- `radix.md`
- `tailwind.md`
- `react.md`

<!-- filename: docs/constitutions/tailwind.md -->

# Tailwind CSS Constitution

## Core principles

- Use Tailwind utilities as the default styling approach.
- Keep styling colocated with components.
- Prefer design tokens and semantic utilities over arbitrary values.
- Build responsive behavior mobile-first.
- Preserve accessible contrast and visible focus states.

## Required patterns

- Use the project’s existing spacing, radius, typography, and color tokens.
- Use `cn()` for conditional class composition.
- Prefer responsive variants over duplicate component markup.
- Use `data-*` and ARIA state variants where supported.
- Keep recurring component styling inside reusable components or variants.
- Use CSS variables for theme-level values.
- Preserve dark-mode compatibility.
- Keep class ordering consistent with the project formatter.
- Remove nested wrapper padding when an information-dense visualization is
  explicitly intended to render edge to edge.
- Use responsive grid columns that preserve a readable minimum card width;
  never increase column count by allowing essential labels to truncate.

## Prohibited patterns

- Inline `style` attributes when Tailwind can express the styling
- Arbitrary pixel values without a design reason
- Repeated long class strings across multiple components
- Dynamic class names Tailwind cannot statically detect
- Using color alone to communicate status
- Removing focus outlines without a visible replacement
- Adding custom CSS for utilities Tailwind already provides

## Extraction rule

Extract a reusable component or variant when:

- The same visual pattern appears repeatedly
- The pattern has meaningful states
- The abstraction improves readability

Do not extract one-off layout wrappers solely to shorten class strings.

## Related constitutions

- `react.md`
- `shadcn.md`
- `radix.md`

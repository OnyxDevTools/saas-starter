<!-- filename: docs/constitutions/lucide.md -->

# Lucide Icons Constitution

## Core principles

- Use Lucide as the default application icon library.
- Icons should support meaning, not replace clear labels.
- Keep icon size and stroke weight consistent.

## Required patterns

- Import icons directly from `lucide-react`.
- Follow the project's standard icon sizes.
- Mark decorative icons with `aria-hidden="true"`.
- Provide accessible names for icon-only buttons.
- Pair unfamiliar actions with text labels.
- Use the icon that most directly represents the action.
- Keep loading indicators visually distinct from static icons.
- For a familiar toggle-like action, the resting icon may communicate current
  state while hover and keyboard focus show the resulting action. Both states
  must preserve the same accessible action label and click target.

## Preferred sizing

- Inline text icon: `size-4`
- Standard control icon: `size-4` or `size-5`
- Dense icon-only control: the glyph may be smaller when the button retains a
  usable focus and click target
- Empty-state icon: size intentionally for the composition

Follow existing project conventions when they differ.

## Prohibited patterns

- Mixing multiple icon libraries without a requirement
- Using emoji as interface icons
- Using an icon as the only label for an ambiguous action
- Hardcoding inconsistent SVG markup
- Applying arbitrary stroke widths across the application
- Adding decorative icons to every heading or button
- Requiring a tooltip when icon state plus an accessible label already makes the
  action clear

## Accessibility rule

Icon-only controls must include one of:

- `aria-label`
- Screen-reader-only text
- A visible text label

A tooltip alone is not an accessible label.

## Related constitutions

- `react.md`
- `tailwind.md`
- `shadcn.md`

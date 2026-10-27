<!-- filename: docs/constitutions/radix.md -->

# Radix UI Constitution

## Use Radix for

- Dialogs
- Dropdown menus
- Popovers
- Tooltips
- Tabs
- Select controls
- Accessible interactive primitives
- Keyboard and focus management

## Required patterns

- Prefer shadcn wrappers when one already exists.
- Preserve Radix component structure.
- Use `asChild` only with components that correctly forward refs and props.
- Provide accessible labels and descriptions.
- Keep dialog titles available to assistive technology.
- Preserve keyboard navigation and Escape-key behavior.
- Ensure focus returns to the trigger when overlays close.
- Use controlled state only when application behavior requires it.
- Test overlays with keyboard-only navigation.

## Prohibited patterns

- Using native browser dialogs (`alert`, `confirm`, or `prompt`) or popup
  windows (`window.open`) for application workflows
- Reimplementing focus traps manually
- Removing required titles without an accessible alternative
- Nesting interactive elements incorrectly with `asChild`
- Blocking Escape-key behavior without a clear requirement
- Using a tooltip as the only source of essential information
- Styling away focus indicators
- Adding click handlers that break keyboard interaction

## Overlay rule

- Use Dialog for blocking tasks.
- Use Popover for contextual interactive content.
- Use Dropdown Menu for actions.
- Use Tooltip for supplementary explanation.
- Use Sheet for secondary workflows or narrow-screen navigation.

## Related constitutions

- `shadcn.md`
- `react.md`
- `tailwind.md`

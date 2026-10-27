<!-- filename: docs/constitutions/ui-design.md -->

# UI Design Constitution

## Primary objective

Optimize the interface for:

1. Clear layout
2. Fast implementation
3. Predictable AI-generated code
4. Dense but readable information
5. Minimal visual decision-making

Branding, decorative styling, and theme variation are not priorities.

## Theme

Use shared semantic light/dark themes. app/globals.css owns token pairs; the
saved theme is applied before paint. Keep 4.5:1 normal text contrast, visible
focus, and status meanings in both themes. No per-page palette or brand colors
inside primitives. SaaS requirements supersede the parent's dark-only rule.

## Color rules

- Use color primarily for actions, status, validation, and selection.
- Do not use color as decoration.
- Do not assign unique colors to sections, cards, or features.
- Do not create page-specific palettes.
- Do not introduce gradients.
- Do not rely on color alone to communicate meaning.
- Prefer typography, spacing, borders, and grouping before adding color.
- Avoid pure black and pure white for large surfaces and body text.

## Layout principles

- Prioritize information hierarchy over decoration.
- Use standard page structures consistently.
- Prefer simple vertical and horizontal layouts.
- Use CSS Grid for page-level structure.
- Use Flexbox for component-level alignment.
- Avoid absolute positioning unless required for overlays.
- Avoid masonry, overlapping panels, and unconventional layouts.
- Keep navigation, page headers, and primary actions in predictable locations.

## Standard page structure

Use this order where applicable:

1. Page title
2. Short description
3. Primary actions
4. Filters or controls
5. Main content
6. Supporting details

Do not invent a new page composition when an existing pattern works.

## Spacing

Use the existing Tailwind spacing scale.

Preferred spacing:

- Tight internal spacing: `gap-2`
- Standard component spacing: `gap-4`
- Section spacing: `gap-6`
- Major page spacing: `gap-8`
- Standard page padding: `p-4`, `p-6`, or responsive equivalents

Avoid arbitrary spacing values.

Use spacing to communicate hierarchy before adding borders, surfaces, or shadows.

## Surfaces

Use flat semantic surfaces in both modes.

Preferred:

- Near-black page background
- Dark neutral surface
- Muted border
- Small or medium radius
- Little or no shadow

Use cards only when content requires a distinct grouping boundary.

Do not wrap every section in a card.

Use surface contrast sparingly. Too many shades create unnecessary visual hierarchy.

## Borders and shadows

- Prefer borders and surface contrast over shadows.
- Use one standard border color.
- Use subtle shadows only for floating elements such as dialogs, menus, and popovers.
- Floating overlays separate from the page with a soft shadow and, at most, a
  hairline reduced-opacity border. Do not draw full-strength outlines around
  dialogs, popovers, or menus.
- Do not stack borders, backgrounds, and shadows without a clear reason.
- Avoid glow effects.

## Typography

Use one sans-serif font family.

Use typography to establish hierarchy:

- Page title
- Section heading
- Body text
- Supporting text
- Label text

Do not introduce decorative fonts.

Prefer:

- Semibold headings
- Normal body text
- Muted supporting text

Avoid excessive font sizes and weights.

## Components

Prefer existing shadcn components before creating custom UI primitives.

Use consistent components for:

- Buttons
- Inputs
- Selects
- Dialogs
- Sheets
- Tabs
- Tables
- Alerts
- Menus
- Tooltips

Do not create visually different versions of the same control without a functional reason.

## Dialogs and browser popups

- Never use native browser dialogs such as `window.alert()`,
  `window.confirm()`, or `window.prompt()`.
- Never open popup windows with `window.open()` for an application workflow.
- Use the project-owned shadcn/ui Dialog or Alert Dialog backed by Radix for
  confirmations, blocking decisions, focused input, and modal workflows.
- Preserve the Radix focus trap, focus return, keyboard navigation, Escape-key
  behavior, accessible title, and accessible description.
- Use inline feedback for validation and non-blocking status when a modal
  decision is not required.

## Buttons

Use only these variants unless another is functionally required:

- Primary
- Secondary
- Outline
- Ghost
- Destructive

Each screen should normally have one visually dominant primary action.

Avoid multiple competing primary buttons.

Use icon-only buttons only for familiar actions and provide accessible labels.

For a familiar state-changing icon, showing current state at rest and the
resulting action on hover or keyboard focus can replace persistent helper text.
Keep an explicit accessible label; a tooltip is optional, not mandatory.

## Forms

- Use a single-column form by default.
- Use multiple columns only for short, closely related fields.
- Place labels above inputs.
- Render switches with the shared `SwitchField` component; a switch label
  always dims while the switch is off.
- Place validation errors near the affected field.
- Use consistent input heights.
- Group related fields with spacing and headings, not decorative containers.
- Keep submit actions in a predictable location.

## Tables

Use tables for structured, comparable data.

- Keep headers visually simple.
- Use subtle row separators.
- Avoid excessive cell borders.
- Align numbers consistently.
- Keep actions in the final column.
- Use badges only for meaningful statuses.
- Provide filtering, sorting, and pagination only when needed.
- Keep hover and selected-row states subtle but visible.

## Time-series charts

- Use actual timestamps on the horizontal axis and numeric values on the
  vertical axis.
- Ensure rounded tick labels remain distinct for flat or narrow price ranges.
- A one-point series should show one timestamp rather than duplicate start and
  end labels.
- Keep the current-value label visually attached to its marker and prevent it
  from clipping at chart edges.
- Hide coincident thresholds when drawing both would create an ambiguous line.
  Do not activate threshold-driven signals until the range is meaningful.

## Status presentation

Use semantic status colors consistently:

- Success: green
- Warning: amber
- Error: red
- Informational or active: blue
- Neutral or inactive: gray

Pair status color with text or an icon.

Do not invent different colors for the same status across features.

## Interaction affordances

- Every interactive element has a visible hover state (background tint,
  border shift, or text color change). No control may look inert on hover.
- Use the correct cursor for the interaction: `cursor-pointer` on clickable
  elements (buttons, links, triggers, rows that navigate), `cursor-text` on
  editable text, `cursor-not-allowed` on disabled controls.
- Keep hover and pressed states subtle and token-based; do not invent
  per-feature hover colors.
- All text remains selectable, including read-only and disabled-looking
  values. Never apply `select-none` or `user-select: none` to textual
  content; reserve it for purely decorative or drag-handle elements.

## Accessibility

- Maintain sufficient contrast between text, controls, borders, and surfaces.
- Do not use low-contrast gray text for essential information.
- Preserve visible keyboard focus states.
- Pair color with text, icons, or shape.
- Ensure disabled controls remain distinguishable from enabled controls.

## Responsive design

- Design mobile-first.
- Prefer natural reflow over separate mobile components.
- Stack controls when horizontal space is insufficient.
- Allow tables to scroll horizontally when necessary.
- Hide secondary information before hiding primary actions.
- Do not duplicate entire desktop and mobile layouts unless unavoidable.

## Loading and empty states

- Use skeletons for content-shaped loading states.
- Use spinners only for small actions or indeterminate operations.
- Keep empty states concise.
- Provide one clear next action when appropriate.
- Avoid illustrations unless explicitly requested.

## Animation

Use animation only to clarify:

- Opening and closing
- State transitions
- Progress
- Reordering
- Feedback after actions

Keep animations short and subtle.

Do not add decorative motion, parallax, or continuous animation.

## Prohibited patterns

- Light mode
- Theme switching
- Gradients
- Glassmorphism
- Decorative background textures
- Multiple accent colors
- Page-specific color schemes
- Colored cards without semantic meaning
- Heavy full-opacity outlines around floating overlays
- Excessive shadows
- Glow effects
- Excessive rounded containers
- Custom spacing values without justification
- Decorative icons on every heading
- Multiple competing primary actions
- Layout changes introduced solely for visual novelty
- Custom primitives when a suitable shadcn component exists

## AI agent decision rule

When multiple designs are reasonable, choose the option with:

1. Fewer components
2. Fewer visual variants
3. Fewer surface shades
4. Fewer colors
5. Less nested markup
6. More standard layout behavior
7. Better reuse of existing project patterns
8. Lower implementation and maintenance cost

Do not add visual complexity unless it improves usability or communicates meaningful state.

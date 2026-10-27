<!-- filename: docs/constitutions/sonner.md -->

# Sonner (Toasts) Constitution

## Use toasts for

- Confirming a completed action (saved, created, deleted)
- Reporting a failed background operation, with a retry action when possible
- Transient, non-blocking status the user does not need to acknowledge

## Required patterns

- Render exactly one `<Toaster />` (from `components/ui/sonner.tsx`) in the
  root layout. Never mount another.
- Call `toast()` / `toast.success()` / `toast.error()` from event handlers or
  mutation lifecycle callbacks, not from render or effects.
- Keep messages to one short sentence; put detail in `description`.
- Use `toast.promise` for operations with pending, success, and error phases.
- Pair failure toasts with an `action` (for example Retry) when the action is
  safe to repeat.
- Use semantic status through the toast variant; do not restyle toasts per
  feature.

## Prohibited patterns

- Toasts as the only surface for form validation errors — validation belongs
  next to the affected field
- Toasts for information the user must acknowledge or act on before
  continuing — use a Dialog
- Persistent or long-duration toasts standing in for inline status
- Stacking multiple toasts for one logical event
- Decorative or celebratory toasts with no informational value

## Related constitutions

- `ui-design.md`
- `tanstack-query.md`
- `radix.md`

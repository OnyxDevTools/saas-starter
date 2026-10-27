<!-- filename: docs/constitutions/zod.md -->

# Zod Constitution

## Use Zod for

- Request validation
- Form validation
- Environment and configuration validation
- External API response validation
- URL parameter validation
- Persisted-state migrations
- Data crossing trust boundaries

## Required patterns

- Validate data where it enters the system.
- Infer TypeScript types from authoritative schemas.
- Use `safeParse` when validation failure is expected.
- Use `parse` when invalid data represents a programming or startup error.
- Return structured, user-safe validation messages.
- Reuse schemas between client and server only when the contract is identical.
- Use schema composition instead of duplicating fields.
- Keep database, transport, form, and UI schemas separate when their contracts differ.
- Use explicit coercion only when the input contract permits it.

## Preferred pattern

```ts
const bookingSchema = z.object({
  propertyId: z.string().min(1),
  guestCount: z.number().int().positive(),
});

type BookingInput = z.infer<typeof bookingSchema>;
```

## Prohibited patterns

- Casting unvalidated data to a TypeScript type
- Treating TypeScript types as runtime validation
- Returning raw Zod errors directly to users
- Creating one universal schema for database, API, form, and UI models
- Silently coercing unexpected values
- Duplicating manually maintained interfaces for authoritative schemas
- Accepting unknown keys when the boundary should be strict

## Boundary rule

Validate:

- Browser input
- Route and query parameters
- Request bodies
- External service responses
- Local storage and persisted Zustand data
- Configuration loaded at startup

Persisted browser state that can outlive a deployment must include a version,
use a strict schema, and fall back safely by removing or ignoring invalid data.
For resumable client jobs, validate both the durable job identifier and the
complete immutable configuration before restarting work.

Internal values do not require repeated validation after crossing a trusted boundary.

## Related constitutions

- `typescript.md`
- `react-hook-form.md`
- `nextjs.md`

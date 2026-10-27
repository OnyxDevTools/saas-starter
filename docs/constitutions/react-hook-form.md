<!-- filename: docs/constitutions/react-hook-form.md -->

# React Hook Form Constitution

## Use React Hook Form for

- Form field state
- Validation errors
- Submission state
- Dirty and touched state
- Dynamic field arrays
- Complex client-side forms

## Required patterns

- Use `useForm` with explicit form value types.
- Use Zod through `zodResolver` for runtime validation.
- Define sensible `defaultValues`.
- Prefer uncontrolled native inputs through `register`.
- Use `Controller` only for controlled third-party components.
- Display field-level errors near their controls.
- Prevent duplicate submission while a request is pending.
- Reset the form intentionally after successful submission.
- Preserve submitted values when server validation fails.
- Use `FormProvider` only when deeply nested fields require shared access.

## Server interaction

- Treat client validation as user experience, not security.
- Validate the same input again on the server.
- Map server field errors back to fields where practical.
- Keep API or Server Action errors separate from field validation errors.

## Prohibited patterns

- Mirroring every form field into Zustand
- Using `useState` and React Hook Form for the same field
- Using `Controller` for every input
- Omitting default values for controlled fields
- Clearing the form before submission succeeds
- Trusting client-side validation on the server
- Using effects to synchronize form values unnecessarily

## Related constitutions

- `zod.md`
- `react.md`
- `shadcn.md`

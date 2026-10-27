<!-- filename: docs/constitutions/typescript.md -->

# TypeScript Constitution

## Required standards

- Use strict TypeScript.
- Keep `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`,
  `noImplicitReturns`, and `noUncheckedIndexedAccess` enabled.
- Do not add JavaScript files.
- Define types at domain and external-system boundaries.
- Prefer narrow, expressive types.
- Model finite states with unions.
- Use exhaustive checks for discriminated unions.
- Validate runtime data before treating it as typed.
- Prefer `unknown` over `any` at untrusted boundaries.
- Use `satisfies` when checking object conformance without widening.
- Export types only when consumed outside the module.

## Preferred patterns

```ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Result }
  | { status: "error"; error: AppError };
```

- Prefer domain identifiers over generic strings when useful.
- Prefer readonly inputs when mutation is not intended.
- Infer types from Zod schemas at validated boundaries.
- Use generics only when they reduce duplication without obscuring intent.

## Prohibited patterns

- `any`
- Unsafe type assertions used to bypass errors
- `@ts-ignore`
- Non-null assertions without a proven invariant
- Broad `Record<string, unknown>` domain models
- Optional fields used to represent mutually exclusive states
- Duplicating types that can be derived from an authoritative schema
- Enums when a string union is sufficient

## Exception policy

Any unavoidable unsafe assertion must:

- Be isolated at a boundary
- Include validation or an explicit invariant
- Include a comment explaining why it is safe

## Related constitutions

- `zod.md`
- `react.md`
- `nextjs.md`

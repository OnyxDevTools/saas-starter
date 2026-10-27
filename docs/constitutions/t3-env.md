<!-- filename: docs/constitutions/t3-env.md -->

# T3 Env Constitution

## Use T3 Env for

- Startup validation of environment variables
- Typed server and client configuration access
- Enforcing the server-secret and `NEXT_PUBLIC_` boundary

## Required patterns

- Define environment schemas only in the root `env.ts` module.
- Use narrow Zod schemas and map every runtime variable explicitly.
- Import the environment module during Next.js configuration so invalid startup
  configuration fails before requests are served.
- Import the validated `env` object instead of reading `process.env` throughout
  application modules.
- Add non-secret required names to `.env.example` without real values.

## Prohibited patterns

- Accessing server variables from Client Components
- Exposing secrets through `NEXT_PUBLIC_` names
- Casting environment values instead of validating them
- Scattering independent environment schemas across features
- Silently skipping validation outside an explicit test-only requirement
- Committing credentials or populated local environment files

## Boundary rule

Raw `process.env` access belongs only in `env.ts`, tool configuration, or
unavoidable platform detection such as `CI`. Application behavior consumes the
validated `env` export.

<!-- filename: docs/constitutions/knip.md -->

# Knip Constitution

## Use Knip for

- Unused dependencies, files, exports, and types
- Unresolved imports and unlisted dependencies
- Circular dependency audits

## Required patterns

- Run `npm run deadcode` after dependency changes and significant refactors.
- Verify reports against framework entry points and dynamic imports before
  changing code.
- Keep configuration narrow and document every intentional ignore.
- Prefer deleting genuinely unused code over adding artificial imports.
- Re-run lint, strict TypeScript, and the production build after cleanup.

## Prohibited patterns

- Running auto-fix without reviewing exact targets
- Ignoring broad directories to silence actionable results
- Treating dynamic framework entries as unused without verification
- Importing a package only to make Knip consider it used

## Decision rule

An intentionally retained baseline package may receive one narrow dependency
ignore with a comment explaining its ownership boundary. Remove the ignore as
soon as production code uses the package.

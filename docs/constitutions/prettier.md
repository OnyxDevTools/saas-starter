<!-- filename: docs/constitutions/prettier.md -->

# Prettier Constitution

## Use Prettier for

- Mechanical formatting of supported source and configuration files
- Consistent line wrapping, punctuation, and whitespace
- Canonical Tailwind utility ordering through `prettier-plugin-tailwindcss`

## Required patterns

- Use the repository-pinned version through `npm run format` or
  `npm run format:check`.
- Keep `prettier-plugin-tailwindcss` last when more plugins are added.
- Keep generated output, dependencies, and test artifacts in
  `.prettierignore`.
- Use ESLint for correctness and Prettier for formatting. Keep
  `eslint-config-prettier` after other ESLint presets.
- Format task-owned files before handoff when doing so cannot overwrite
  concurrent work.

## Prohibited patterns

- Running an unpinned global or temporary Prettier version
- Adding stylistic ESLint rules that conflict with Prettier
- Manually rearranging Tailwind classes against the plugin's canonical order
- Formatting unrelated files merely to create a repository-wide diff
- Running `--write` across files actively owned by another task

## Validation

Use `npm run format:check` for a read-only formatting check. Treat failures as
mechanical work, not a reason to suppress files broadly.

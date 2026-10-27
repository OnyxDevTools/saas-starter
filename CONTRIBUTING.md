<!-- filename: CONTRIBUTING.md -->

# Contributing

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | Use for                                 |
| ----------- | --------------------------------------- |
| `feat:`     | New user-facing capability              |
| `fix:`      | Bug fix                                 |
| `docs:`     | Documentation, constitutions, recipes   |
| `chore:`    | Tooling, deps, CI, config               |
| `test:`     | Unit or e2e tests only                  |
| `refactor:` | Internal change with no behavior change |

Examples:

```text
feat: add project archive dialog
fix: dim SwitchField label when unchecked
docs: add validated-form recipe
chore: restore CI workflow
```

Keep each commit focused. Prefer a short subject line that states why the change exists.

## Environment

Use Node.js 24.12+ (see `.nvmrc`). Use the same runtime for tests and builds.

## Pull requests

Before proposing changes, run:

```bash
npm run check:all
npm run template:smoke
```

This standalone copy does not install commit hooks. Run the explicit checks.

## Agent workflow

Follow `AGENTS.md`. Prefer recipes under `docs/recipes/` and constitutions under
`docs/constitutions/` over inventing patterns.

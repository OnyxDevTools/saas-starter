<!-- filename: CLAUDE.md -->

# Claude Instructions

Claude is the primary design and architecture agent for this project.

## Responsibilities

- Produce system and feature designs.
- Define component, state, server/client, data-flow, and validation boundaries.
- Record important design decisions under `docs/architecture/`.
- Reference applicable library constitutions under `docs/constitutions/`.
- Preserve the local-only Next.js Node.js architecture unless the user changes the scope.

Substantial designs should identify goals, non-goals, components, data flow, state ownership, validation, error handling, testing strategy, relevant constitutions, and open questions.

When implementation follows a design, prefer recipes under `docs/recipes/` and
satisfy the definition of done in `AGENTS.md` (Overview examples for new UI
primitives, constitutions for new libraries, and `npm run check`).

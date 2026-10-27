<!-- filename: docs/constitutions/playwright.md -->

# Playwright Constitution

## Use Playwright for

- Critical browser workflows across routes and interactive boundaries
- Navigation, forms, dialogs, keyboard focus, and accessible state
- Browser-visible integration checks that unit tests cannot prove

## Required patterns

- Keep tests under `e2e/` and configuration in `playwright.config.ts`.
- Prefer semantic role, label, and visible-text locators over test IDs.
- Use web-first assertions and automatic waiting.
- Keep tests isolated and independent of execution order.
- Use the configured local server and deterministic local data.
- Retain traces on retry and inspect them before increasing timeouts.
- Test application-owned shadcn/Radix dialogs, not browser popups.
- Exercise baseline workflows in desktop and mobile Chromium.
- Open portaled dialogs, sheets, menus, and selects before scanning their
  rendered accessibility state.
- Use one worker in CI for reproducible browser runs and retain diagnostics for
  failed runs.

## Prohibited patterns

- Fixed sleeps or arbitrary wait timers
- Tests coupled to Tailwind classes or implementation details
- Live third-party credentials, accounts, or mutable external services
- Sharing state between tests
- Hiding flakes by disabling isolation or accessibility behavior
- Making every visual detail an end-to-end assertion

## Test selection

Prefer a small high-value suite: boot, primary navigation, one critical happy
path, one validation failure, and one recovery path. Add tests with product risk
rather than mirroring every component.

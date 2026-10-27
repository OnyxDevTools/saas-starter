<!-- filename: docs/verification.md -->

# Verification record

This project is copied from Admin Starter without
runtime imports or symlinks to any sibling. No database schema was published to a
live database, and no live charge or real email was created.

Executed on Node 24.22.1:

- Strict TypeScript, ESLint (zero warnings), Prettier and Knip passed.
- Vitest and React Testing Library: 42 tests passed across seven test files.
  Coverage includes cross-tenant reads/record IDs/aggregates/outbox, roles,
  last-owner protection, simultaneous departures, simultaneous last-seat and invitation acceptance, simultaneous last-project
  entitlement claims, uncertain-write locks, idempotent create replay,
  pending-invitation seats, expiry/revocation/verified-email/token/replay behavior,
  private outbox/no SMTP in preview, demo-vs-Stripe separation, signed Stripe
  events, duplicate processing, failed-attempt recovery and out-of-order state.
- Local schema validation and official typed schema generation passed.
- A clean-copy install/rename/check/schema/build smoke passed independently.
- Production Next.js build passed without a live database or Firebase connection.
- Playwright: four desktop/mobile scenarios passed using the official Firebase
  Auth Emulator, real Firebase client/Admin session exchange, real application
  Server Actions and the real Onyx SDK against an explicit test HTTP transport.
  These scenarios exercise onboarding, organization switching, project
  create/edit/archive/search/reload, role-restricted team UI, encrypted private
  outbox, verified-email invitation acceptance/replay, cross-organization denial,
  demonstration billing, public/auth routes and theme behavior. The full flow
  includes axe checks of the actual persisted dashboard in both themes, visible persisted-data bars, and no mobile horizontal overflow.
- Production dependency audit: zero vulnerabilities. Full development-tool audit
  reports five moderate advisories in firebase-tools transitive dependencies;
  no forced major downgrades were applied. A compatible gRPC patch override
  removes the Firebase SDK's reported high-severity transitive advisory.

Fixtures and emulator identities live under tests only; the normal runtime does
not choose them. Firebase emulator enablement is restricted to explicit demo
projects on loopback outside production. Test data is not evidence of live Onyx
persistence or real Stripe/SMTP integration.

Concrete live configuration still required: application Firebase project/client
settings and Admin credentials, existing authorized Onyx downloaded config and
explicit schema setup, APP_ORIGIN, and a stable invitation encryption key.
Stripe and SMTP require their own optional settings and provider-side setup.
Real provider callbacks, delivery and charges were deliberately not exercised.

Official integration references used during implementation:

- https://onyx.dev/documentation/sdk-reference/typescript
- https://firebase.google.com/docs/auth/admin/manage-cookies
- https://firebase.google.com/docs/emulator-suite/connect_auth
- https://docs.stripe.com/billing/subscriptions/webhooks
- https://react.email/docs/integrations/nodemailer
- https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/chart.tsx

## SaaS-specific theme review

Parchment / Aubergine / Clay, Manrope body text and Lora display headings replace
the inherited blue/gray styling. The sidebar, selected navigation, controls,
public pages, chart, favicon and email are coordinated. Theme changes passed the
42-test suite, production build and four desktop/mobile browser scenarios with
accessibility checks in both modes. Light/dark and mobile screens were visually
reviewed; public/template-preview.png is the current real application capture.

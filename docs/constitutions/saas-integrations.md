<!-- filename: docs/constitutions/saas-integrations.md -->

# SaaS integrations

Firebase client auth exchanges verified recent ID tokens for official HttpOnly
Admin SDK session cookies; validate revocation, current user and email. Emulators
require explicit demo projects outside production. Never trust platform preview
identity as an application user.

Stripe webhooks verify raw signatures before persistence. Keep durable event
attempts, customer/tenant linkage, duplicate detection and current-state
reconciliation. Return retryable failures and preserve attempt history. Demo mode
is explicit, labeled, non-production and distinct from Stripe entitlements.

React Email renders escaped templates. Scope outbox reads by membership/role and
keep tokens encrypted; only hashes live in invitations. SMTP is explicit, bounded
and at-least-once under failure. Never send real mail or make charges in tests.

Chart data must be persisted or clearly marked illustrative; keep semantic colors,
legends and readable labels. React Testing Library covers form behavior; browser
tests cover actual verified sessions and service-backed workflows.

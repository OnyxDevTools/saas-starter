<!-- filename: AGENTS.md -->

# SaaS Starter

Read README.md and docs/architecture/system-design.md first, then relevant library
constitutions. This is an Admin Starter derivative, independently runnable as one
Next.js/Node modular monolith. Do not add another backend, database or worker.

- Preserve the inherited accessible primitives and component reference. SaaS UI
  has light/dark semantic themes; update tokens and verify contrast/focus in both.
- modules/auth owns Firebase verification. The Onyx private preview gate is not an
  application user/session. Never trust arbitrary identity headers or add bypasses.
- modules/organizations owns membership, roles, last-owner protection and scoped
  reads; derive identity from the verified session. Recheck access inside locks.
- All organization writes share an insert-only lock. Never imply CAS/transactions
  or expire/take over locks automatically. Unknown failures require explicit recovery.
- modules/projects owns project entitlements; pending unexpired invitations count
  toward seats. Validate tenant scope on IDs, reads, aggregates and exports alike.
- Billing events are signature-verified before persistence and reconcile current
  provider state. Keep duplicate/retry state durable. Never grant access on redirects.
- Demo billing is explicit, labeled and forbidden in production. Do not turn demo
  subscriptions into real ones or perform live charges while testing.
- Invitation hashes stay in Invitation; only encrypted token material is stored
  for the authorized outbox. Check verified email, expiry, revocation and replay.
- React Email + optional SMTP remain behind a small interface. No public outbox,
  automatic resend loop or real email delivery during tests.
- Use lazy official Onyx SDK construction, bounded/no-store requests and safe
  errors. Preserve existing config resolution. No schema/seed writes on import/build.
- Generated schema types are official SDK output; validate stored rows with Zod.
- Keep filename comments and valid use-client/use-server directive ordering.
- Use Server Components for initial reads, Server Actions for application writes,
  Route Handlers for integrations. Keep privileged SDKs server-only.
- Run npm run check, npm run test:e2e and schema:validate; report emulator/fixture
  evidence separately from live integration. Preserve unrelated starter repositories.
- Commit or push only when explicitly requested. Deployment, live schema changes,
  real email delivery and live charges require their own explicit authorization.

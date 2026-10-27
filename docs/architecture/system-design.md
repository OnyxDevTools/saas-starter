<!-- filename: docs/architecture/system-design.md -->

# System design

One full-stack Next.js App Router application and one deployable Node process.
Admin Starter supplies strict TS, Tailwind tokens, shadcn/Radix primitives,
React Hook Form/Zod, TanStack Table and the existing testing conventions.

Application modules own auth, organizations/invitations, projects, billing and
notifications. app routes compose those services; actions derive identity from
Firebase session cookies and validate inputs. Components never construct database
clients. The Onyx adapter owns transport, parsing, pagination, timeouts and safe
errors. Typed tables and official generated types live under api/ and lib/onyx/.

Membership scope precedes every organization read and is rechecked inside every
mutation lock. Queries, usage counts, invoices/subscriptions, audit events and
outbox previews use that same tenant boundary. A verified invitation grants only
its matching-email acceptance path, never general organization access.

Insert-only locks provide cross-instance exclusion, not multi-table transactions.
Unknown failures retain locks; operator recovery requires all writers stopped and
inspection of partial effects. This deliberately trades availability for invariant
safety. Counts are bounded; scale beyond 2,000 rows/query requires indexed aggregate
or incremental-state design. No shared data cache hides revocations or plan changes.

Billing uses a provider interface; demonstration and Stripe state remain separate.
Verified webhooks persist retry state and reconcile current provider state. Outbox
notifications persist typed state and encrypted token material; rendering and SMTP
are app-owned optional adapters. There is no background worker or hidden queue.

Private Onyx workspace preview access remains an outer gate. Only this app's
verified Firebase user becomes a SaaS member. Publishing never depends on preview
identity. Missing config is explicit; the test HTTP transport and Firebase emulator
are selected only by separate test scripts, not runtime fallbacks.

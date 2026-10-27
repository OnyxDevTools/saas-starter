<!-- filename: docs/onyx.md -->

# Onyx application persistence

See README.md for downloaded configuration, explicit schema commands, verified-user
seeding, scope and lock recovery. This SaaS derivative replaces Admin Starter's
single Task CLI with typed Profile, Organization, Membership, Invitation, Project,
Subscription, BillingEvent, Notification, AuditEvent and MutationLock tables.

lib/onyx/store.ts is the server-only adapter. Construction is lazy, config resolution
is official, and every record is validated. modules owns business invariants;
app/ routes and Server Actions derive identity from verified Firebase sessions.
Do not introduce runtime mocks, global data snapshots, client credentials, implicit
schema publication, undocumented transactions or TTL lock takeover.

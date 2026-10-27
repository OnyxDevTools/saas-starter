<!-- filename: docs/constitutions/onyx.md -->

# Onyx

Use the lazy server-only adapter and official generated types. Validate actual
rows with Zod. Keep scoped pagination/counts bounded, requests no-store with a
deadline, retries disabled for writes, and errors sanitized. IDs are server-owned
or stable idempotency IDs validated by the service. Insert for creation, filtered
updates with affected counts for existing rows. Do not assume transactional CAS.
All invariant-bearing organization writes use the same insert-only lock and
recheck authorization after acquisition. Retain locks on uncertain failures.
Schema and seed operations are explicit operator commands, never startup/build.

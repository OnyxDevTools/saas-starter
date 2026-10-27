<!-- filename: docs/authentication.md -->

# Identity boundaries

The existing Onyx host supplies verified private workspace access outside the
application. That protects access to a workspace preview; it does not identify a
SaaS organization member. This app uses its own Firebase project and the existing
Firebase service-account configuration convention with the official Node SDK.
No X-User, preview identity, platform token, task gateway or workspace cookie is
trusted by the application.

Session exchange requires exact trusted Origin, JSON, a bounded body, revoked-token
verification and recent sign-in. The HttpOnly cookie is verified with revocation
checks and the current Firebase user on every private request. Email verification
is required before onboarding, membership, invitation acceptance and private data.
The server derives UID/email; forms never supply identity. Membership is always
looked up by the verified UID and requested organization, then authorization is
rechecked inside the organization mutation lock.

Firebase emulator support is the official SDK path, not a custom test session.
Only explicit non-production demo projects on loopback may enable it. Normal
missing configuration renders setup guidance; there is no hard-coded user,
unsigned arbitrary header mode or in-memory runtime database fallback.

Official references:

- https://firebase.google.com/docs/auth/admin/manage-cookies
- https://firebase.google.com/docs/emulator-suite/connect_auth
- https://nextjs.org/docs/app/guides/authentication

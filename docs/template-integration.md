<!-- filename: docs/template-integration.md -->

# Template integration

Copy this project independently of sibling starters, excluding dependencies,
outputs, credentials, .env.local and emulator state. Preserve package-lock.json,
.env.example, generated types, schema, agent guidance and documentation. Use
Node 24.12+, npm ci, and npm run template:init -- --name "Team Space" --slug team-space.
Configure the application's Firebase project, existing Onyx downloaded config and
APP_ORIGIN, then explicitly review schema diff/publish before starting Next.
Normal production build does not require a live Firebase/Onyx connection.

There is one Node app; dev uses next dev on the assigned loopback port. Private
workspace preview identity is external to the app and does not grant membership.
Use this template for authenticated multi-organization SaaS projects. No hosting
adapter, deployment workflow, provider account provisioning or automatic schema
publication is included.

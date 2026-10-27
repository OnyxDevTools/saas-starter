// filename: scripts/seed.ts
import { firebaseAdmin } from "../modules/auth/admin";
import { services } from "../modules/services";
import { ensure } from "../lib/errors";
async function main() {
  const uid = process.argv[process.argv.indexOf("--user-uid") + 1];
  ensure(
    process.argv.includes("--user-uid") && uid,
    400,
    "Use npm run seed -- --user-uid <verified Firebase application user UID>.",
  );
  const user = await firebaseAdmin().getUser(uid);
  ensure(
    user.emailVerified && user.email && !user.disabled,
    400,
    "The seed owner must be a real verified application account.",
  );
  const actor = {
      uid: user.uid,
      email: user.email,
      emailVerified: true,
      name: (user.displayName || user.email).slice(0, 80),
    },
    s = services();
  const organizationId = await s.organizations.create(actor, {
    name: "Studio Workspace",
    requestId: "dc0e2f80-4c94-4e21-a9dc-c1537fa98221",
  });
  for (const [name, description, requestId] of [
    [
      "Welcome aboard",
      "Explore your team's first shared workspace.",
      "0ab2973c-1d62-4d45-96e9-f3f9e307af10",
    ],
    [
      "The next chapter",
      "Shape the next project around your business.",
      "a363dddc-de43-4df7-a8f5-5e8d25c3b6c2",
    ],
  ]) {
    await s.projects.create(
      actor,
      organizationId,
      { name, description },
      requestId!,
    );
  }
  console.log(
    `Development sample data ready in organization ${organizationId}. Existing records were preserved.`,
  );
}
main().catch(() => {
  console.error(
    "Seed could not complete. Check the verified application user, Onyx configuration, schema, entitlements, and recovery locks.",
  );
  process.exitCode = 1;
});

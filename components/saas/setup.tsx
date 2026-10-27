// filename: components/saas/setup.tsx
import Link from "next/link";
export function SetupGuidance({
  message = "Connect your application services to continue.",
}: {
  message?: string;
}) {
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-6 py-20">
      <p className="text-primary text-xs font-semibold tracking-widest uppercase">
        Application setup
      </p>
      <h1 className="text-3xl font-semibold">A few connections to make</h1>
      <p className="text-muted-foreground leading-7">{message}</p>
      <ol className="text-muted-foreground list-decimal space-y-3 pl-5 text-sm">
        <li>
          Use your application’s Firebase project and server credentials. Onyx
          workspace preview access does not create an application session.
        </li>
        <li>
          Use the existing downloaded Onyx configuration, then review and
          publish the application schema explicitly.
        </li>
        <li>
          Set APP_ORIGIN and run npm run setup:secrets for encrypted invitation
          previews. Billing and SMTP are optional.
        </li>
      </ol>
      <p className="text-sm">
        See README.md in the project for complete setup instructions.
      </p>
      <Link href="/sign-in" className="text-primary underline">
        Return to sign in
      </Link>
    </main>
  );
}

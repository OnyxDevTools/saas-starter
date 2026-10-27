// filename: app/verify-email/page.tsx
import { VerificationControls } from "@/components/saas/auth-form";
import { PublicShell } from "@/components/saas/public-shell";
export default function VerifyEmail() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-lg space-y-6 py-20">
        <h1 className="text-3xl font-semibold">Check your inbox</h1>
        <p className="text-muted-foreground leading-7">
          Follow the Firebase verification link sent to your application email.
          Verified email is required before joining or creating an organization.
        </p>
        <VerificationControls />
      </main>
    </PublicShell>
  );
}

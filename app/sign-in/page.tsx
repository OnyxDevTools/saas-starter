// filename: app/sign-in/page.tsx
import Link from "next/link";
import { AuthForm } from "@/components/saas/auth-form";
import { PublicShell } from "@/components/saas/public-shell";
export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  return (
    <PublicShell>
      <main className="mx-auto max-w-md space-y-7 py-16">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Sign in to your workspace
          </h1>
        </div>
        {!configured && (
          <p
            role="status"
            className="bg-muted text-muted-foreground rounded-lg p-4 text-sm"
          >
            Firebase is not configured. Set the public Firebase application
            settings and server credentials described in README.md. Private Onyx
            preview access does not sign you into this app.
          </p>
        )}
        <AuthForm {...(next ? { next } : {})} />
        <p className="text-muted-foreground text-sm">
          New here?{" "}
          <Link href="/sign-up" className="text-primary underline">
            Create an account
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}

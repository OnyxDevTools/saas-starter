// filename: app/sign-up/page.tsx
import Link from "next/link";
import { AuthForm } from "@/components/saas/auth-form";
import { PublicShell } from "@/components/saas/public-shell";
export default function SignUp() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-md space-y-7 py-16">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            A fresh start
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Make room for your team
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Create your account, verify your email, then open your first
            organization.
          </p>
        </div>
        <AuthForm signUp />
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}

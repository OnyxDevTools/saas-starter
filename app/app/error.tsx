"use client";
// filename: app/app/error.tsx
import { Button } from "@/components/ui/button";
export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl space-y-5 px-6 py-20">
      <h1 className="text-3xl font-semibold">
        This workspace couldn’t be loaded.
      </h1>
      <p className="text-muted-foreground leading-7">
        Your session or membership may have changed, or a connected service may
        be unavailable. Sign in again if needed and check the application setup.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}

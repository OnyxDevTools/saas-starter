"use client";
// filename: app/error.tsx

import { CircleAlert, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="bg-destructive/10 text-destructive ring-destructive/20 mx-auto flex size-12 items-center justify-center rounded-lg ring-1 ring-inset">
          <CircleAlert className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          The application could not recover from this error. Try again.
        </p>
        <Button className="mt-6" variant="outline" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  );
}

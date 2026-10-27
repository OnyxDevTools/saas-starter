// filename: app/not-found.tsx
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="bg-muted text-muted-foreground ring-border mx-auto flex size-12 items-center justify-center rounded-lg ring-1 ring-inset">
          <FileQuestion className="size-5" aria-hidden="true" />
        </div>
        <p className="text-muted-foreground mt-5 font-mono text-xs font-medium">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          The page you requested does not exist.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Return home
          </Link>
        </Button>
      </div>
    </main>
  );
}

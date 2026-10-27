// filename: app/components/page.tsx
import { requireActor } from "@/modules/auth/session";
import { Suspense } from "react";

import { ControlsSection } from "../_reference/controls-section";
import { FoundationsSection } from "../_reference/foundations-section";
import { PatternsSection } from "../_reference/patterns-section";

export default async function OverviewPage() {
  await requireActor();
  return (
    <div className="space-y-12">
      <FoundationsSection />
      <ControlsSection />

      {/* useQueryState reads search params, which requires Suspense during static prerender. */}
      <Suspense>
        <PatternsSection />
      </Suspense>
    </div>
  );
}

// filename: components/saas/brand-mark.tsx
import { Aperture } from "lucide-react";
export function BrandMark() {
  return (
    <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-2xl">
      <Aperture className="size-6" strokeWidth={1.5} aria-hidden="true" />
    </span>
  );
}

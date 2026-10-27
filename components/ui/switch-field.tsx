// filename: components/ui/switch-field.tsx
import * as React from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function SwitchField({
  id,
  label,
  className,
  ...props
}: React.ComponentProps<typeof Switch> & {
  id: string;
  label: React.ReactNode;
}) {
  return (
    <div
      data-slot="switch-field"
      className={cn("flex items-center justify-between gap-4", className)}
    >
      {/* Switch renders first so the label can react to its peer state. */}
      <Switch id={id} className="order-2" {...props} />
      <Label
        htmlFor={id}
        className="peer-data-[state=unchecked]:text-muted-foreground order-1 transition-colors"
      >
        {label}
      </Label>
    </div>
  );
}

export { SwitchField };

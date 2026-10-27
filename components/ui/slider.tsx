"use client";
// filename: components/ui/slider.tsx

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  (
    | { thumbLabel: string; thumbLabelledBy?: never }
    | { thumbLabel?: never; thumbLabelledBy: string }
  );

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, thumbLabel, thumbLabelledBy, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    data-slot="slider"
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="bg-input relative h-1.5 w-full grow overflow-hidden rounded-full">
      <SliderPrimitive.Range className="bg-primary absolute h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={thumbLabel}
      aria-labelledby={thumbLabelledBy}
      className="border-primary bg-background focus-visible:ring-primary/20 block size-4 rounded-full border-2 shadow-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

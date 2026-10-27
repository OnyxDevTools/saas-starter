"use client";
// filename: components/ui/sonner.tsx

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border":
            "color-mix(in srgb, var(--border) 50%, transparent)",
          "--success-text": "var(--success)",
          "--error-text": "var(--destructive)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };

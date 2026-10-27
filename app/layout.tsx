// filename: app/layout.tsx
import project from "@/project.json";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Lora } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import AppProviders from "./providers";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: project.name,
    template: `%s · ${project.name}`,
  },
  description: "A calm shared space for teams, projects, and what comes next.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e7" },
    { media: "(prefers-color-scheme: dark)", color: "#231c27" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("saas-theme");var l=t?t==="light":matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.dataset.theme=l?"light":"dark";document.documentElement.classList.toggle("dark",!l);}catch(e){}',
          }}
        />
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${plexMono.variable}`}
      >
        <AppProviders>{children}</AppProviders>
        <Toaster
          position="top-center"
          expand={false}
          visibleToasts={4}
          gap={8}
          richColors
        />
      </body>
    </html>
  );
}

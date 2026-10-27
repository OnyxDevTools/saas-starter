// filename: next.config.ts
import type { NextConfig } from "next";

import { env } from "./env";
import project from "./project.json";
import { projectIdentitySchema } from "./lib/project";

void env;
projectIdentitySchema.parse(project);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
] as const;

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  poweredByHeader: false,
  serverExternalPackages: [
    "@onyx.dev/onyx-database",
    "firebase-admin",
    "stripe",
    "nodemailer",
  ],
  async headers() {
    return [
      ...[
        "/app/:path*",
        "/onboarding",
        "/invite/:path*",
        "/api/:path*",
        "/components",
      ].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      })),
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;

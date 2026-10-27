// filename: app/api/health/route.ts
import { NextResponse } from "next/server";

import project from "@/project.json";

export function GET() {
  return NextResponse.json(
    { application: project.slug, status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

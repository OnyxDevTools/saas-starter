// filename: app/api/ready/route.ts
import { createStore } from "@/lib/onyx/store";
import { firebaseAdmin } from "@/modules/auth/admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    firebaseAdmin();
    await createStore().page("Organization", {}, 1);
    return Response.json(
      { status: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "setup-required" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

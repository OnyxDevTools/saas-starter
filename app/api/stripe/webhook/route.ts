// filename: app/api/stripe/webhook/route.ts
import { AppError } from "@/lib/errors";
import { limitedText } from "@/lib/http";
import { billingMode } from "@/modules/billing/plans";
import { verifyStripeEvent } from "@/modules/billing/stripe";
import { services } from "@/modules/services";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (billingMode() !== "stripe")
    return Response.json(
      { error: "Stripe billing is disabled." },
      { status: 409 },
    );
  let event;
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature)
      return Response.json(
        { error: "Invalid webhook signature." },
        { status: 400 },
      );
    event = verifyStripeEvent(await limitedText(request, 1048576), signature);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof AppError && error.status === 503
            ? "Stripe webhook configuration is incomplete."
            : "Invalid webhook signature.",
      },
      { status: error instanceof AppError && error.status === 503 ? 503 : 400 },
    );
  }
  if (!event) return Response.json({ received: true, ignored: true });
  try {
    const ok = await services().billing.receive(event);
    return Response.json({ received: ok }, { status: ok ? 200 : 500 });
  } catch {
    return Response.json(
      { error: "Billing event could not be processed; retry is safe." },
      { status: 500 },
    );
  }
}

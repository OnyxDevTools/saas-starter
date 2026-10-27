// filename: modules/billing/demo.ts
import "server-only";
import { ensure } from "../../lib/errors";
import type { Rows } from "../models";
import { requireDemonstration } from "./plans";
import type { PlanProvider } from "./provider";
export class DemonstrationProvider implements PlanProvider {
  readonly kind = "demo" as const;
  async change(subscription: Rows["Subscription"], plan: "free" | "team") {
    requireDemonstration();
    ensure(
      subscription.provider !== "stripe",
      409,
      "A Stripe subscription cannot become a demonstration subscription.",
    );
    return {
      kind: "persisted" as const,
      subscription: {
        ...subscription,
        provider: "demo" as const,
        plan,
        status: "active" as const,
        stripeCustomerId: "",
        stripeSubscriptionId: "",
        priceId: "",
        currentPeriodEnd: "",
        updatedAt: new Date().toISOString(),
      },
    };
  }
}

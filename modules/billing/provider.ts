// filename: modules/billing/provider.ts
import type { Rows } from "../models";
export type PlanChange =
  | { kind: "persisted"; subscription: Rows["Subscription"] }
  | { kind: "redirect"; url: string };
export interface PlanProvider {
  readonly kind: "demo" | "stripe";
  change(
    subscription: Rows["Subscription"],
    plan: "free" | "team",
  ): Promise<PlanChange>;
}

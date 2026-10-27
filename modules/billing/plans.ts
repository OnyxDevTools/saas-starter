// filename: modules/billing/plans.ts
import { z } from "zod";
import { ensure } from "../../lib/errors";
import type { Rows } from "../models";
export type BillingMode = "disabled" | "demo" | "stripe";
export function billingMode(): BillingMode {
  return z
    .enum(["disabled", "demo", "stripe"])
    .parse(process.env.BILLING_MODE || "disabled");
}
export function applicationEnvironment() {
  const configured = z
    .enum(["development", "preview", "production"])
    .parse(
      process.env.APP_ENV ||
        (process.env.NODE_ENV === "production" ? "production" : "development"),
    );
  // A copied development env file cannot accidentally enable demo billing in a
  // production Node process. Only an explicit preview environment may opt in.
  return process.env.NODE_ENV === "production" && configured === "development"
    ? "production"
    : configured;
}
export function plans() {
  const limit = (value: string | undefined, fallback: number) =>
    z.coerce
      .number()
      .int()
      .min(1)
      .max(1000)
      .parse(value || fallback);
  return {
    free: {
      name: "Free",
      projects: limit(process.env.FREE_PROJECT_LIMIT, 3),
      seats: limit(process.env.FREE_SEAT_LIMIT, 3),
    },
    team: {
      name: "Team",
      projects: limit(process.env.TEAM_PROJECT_LIMIT, 50),
      seats: limit(process.env.TEAM_SEAT_LIMIT, 20),
    },
  };
}
export function requireDemonstration() {
  ensure(
    billingMode() === "demo" &&
      process.env.ALLOW_DEMO_BILLING === "1" &&
      applicationEnvironment() !== "production",
    403,
    "Demonstration billing must be explicitly enabled outside production.",
  );
}
export function effectivePlan(
  subscription: Rows["Subscription"] | null,
  mode: BillingMode = billingMode(),
  production = applicationEnvironment() === "production",
) {
  if (
    !subscription ||
    subscription.status !== "active" ||
    subscription.plan !== "team"
  )
    return "free" as const;
  if (subscription.provider === "stripe" && mode === "stripe")
    return "team" as const;
  if (
    subscription.provider === "demo" &&
    mode === "demo" &&
    !production &&
    process.env.ALLOW_DEMO_BILLING === "1"
  )
    return "team" as const;
  return "free" as const;
}

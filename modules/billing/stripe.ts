// filename: modules/billing/stripe.ts
import "server-only";
import Stripe from "stripe";
import { ensure } from "../../lib/errors";
import type { PlanProvider } from "./provider";
import type { Rows } from "../models";
import { applicationEnvironment } from "./plans";
export function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  ensure(secret, 503, "Stripe is not configured.");
  ensure(
    applicationEnvironment() === "production" || secret.startsWith("sk_test_"),
    503,
    "Only Stripe test keys may be used outside production.",
  );
  return new Stripe(secret, { timeout: 8000, maxNetworkRetries: 0 });
}
export type SubscriptionSnapshot = {
  id: string;
  customerId: string;
  organizationId: string;
  priceId: string;
  active: boolean;
  status: "active" | "past_due" | "canceled" | "inactive";
  periodEnd: string;
};
export type VerifiedBillingEvent = {
  id: string;
  type: string;
  objectId: string;
  customerId: string;
  subscriptionId: string;
  created: number;
};
export interface BillingProvider extends PlanProvider {
  createCustomer(organizationId: string, email: string): Promise<string>;
  checkout(organizationId: string, customerId: string): Promise<string>;
  portal(customerId: string): Promise<string>;
  snapshot(subscriptionId: string): Promise<SubscriptionSnapshot>;
  current(
    customerId: string,
    organizationId: string,
  ): Promise<SubscriptionSnapshot>;
  checkoutSubscription(
    sessionId: string,
  ): Promise<{ subscriptionId: string; customerId: string }>;
}
export class StripeProvider implements BillingProvider {
  readonly kind = "stripe" as const;
  async change(subscription: Rows["Subscription"], plan: "free" | "team") {
    ensure(
      plan === "team" &&
        subscription.provider === "stripe" &&
        subscription.stripeCustomerId,
      409,
      "Manage existing Stripe subscriptions in the customer portal.",
    );
    return {
      kind: "redirect" as const,
      url: await this.checkout(
        subscription.organizationId,
        subscription.stripeCustomerId,
      ),
    };
  }
  constructor(private readonly stripe: Stripe = stripeClient()) {}
  async createCustomer(organizationId: string, email: string) {
    const customer = await this.stripe.customers.create(
      { email, metadata: { organizationId } },
      { idempotencyKey: `saas-customer-${organizationId}` },
    );
    return customer.id;
  }
  async checkout(organizationId: string, customerId: string) {
    const price = process.env.STRIPE_TEAM_PRICE_ID,
      origin = process.env.APP_ORIGIN;
    ensure(
      price && origin,
      503,
      "Configure STRIPE_TEAM_PRICE_ID and APP_ORIGIN.",
    );
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: organizationId,
      metadata: { organizationId },
      subscription_data: { metadata: { organizationId } },
      success_url: new URL(
        `/app/${organizationId}/billing?checkout=returned`,
        origin,
      ).href,
      cancel_url: new URL(`/app/${organizationId}/billing`, origin).href,
    });
    ensure(session.url, 503, "Stripe did not return a checkout URL.");
    return session.url;
  }
  async portal(customerId: string) {
    ensure(process.env.APP_ORIGIN, 503, "Configure APP_ORIGIN.");
    return (
      await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: new URL("/app", process.env.APP_ORIGIN).href,
      })
    ).url;
  }
  async snapshot(id: string) {
    const subscription = await this.stripe.subscriptions.retrieve(id);
    const customer =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    const item = subscription.items.data[0];
    const active = ["active", "trialing"].includes(subscription.status);
    return {
      id: subscription.id,
      customerId: customer,
      organizationId: subscription.metadata.organizationId || "",
      priceId: item?.price.id || "",
      active,
      status: active
        ? ("active" as const)
        : subscription.status === "past_due"
          ? ("past_due" as const)
          : ["canceled", "unpaid"].includes(subscription.status)
            ? ("canceled" as const)
            : ("inactive" as const),
      periodEnd: item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : "",
    };
  }
  async current(customerId: string, organizationId: string) {
    const list = await this.stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    ensure(
      !list.has_more,
      503,
      "Stripe customer exceeds the bounded subscription scan; review reconciliation.",
    );
    const candidates = list.data
      .filter((row) => row.metadata.organizationId === organizationId)
      .sort((a, b) => b.created - a.created || b.id.localeCompare(a.id));
    const selected =
      candidates.find((row) => ["active", "trialing"].includes(row.status)) ||
      candidates[0];
    ensure(selected, 409, "No subscription is linked to this organization.");
    return this.snapshot(selected.id);
  }
  async checkoutSubscription(id: string) {
    const session = await this.stripe.checkout.sessions.retrieve(id);
    const subscription =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const customer =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    ensure(
      subscription && customer && session.mode === "subscription",
      422,
      "Checkout is not a subscription session.",
    );
    return { subscriptionId: subscription, customerId: customer };
  }
}
export function verifyStripeEvent(
  body: string,
  signature: string,
): VerifiedBillingEvent | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  ensure(secret, 503, "Stripe webhook signing secret is not configured.");
  const event = stripeClient().webhooks.constructEvent(body, signature, secret);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customer =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    return {
      id: event.id,
      type: event.type,
      objectId: session.id,
      customerId: customer || "",
      subscriptionId: "",
      created: event.created,
    };
  }
  if (event.type.startsWith("customer.subscription.")) {
    const object = event.data.object as Stripe.Subscription;
    const customer =
      typeof object.customer === "string"
        ? object.customer
        : object.customer.id;
    return {
      id: event.id,
      type: event.type,
      objectId: object.id,
      customerId: customer,
      subscriptionId: object.id,
      created: event.created,
    };
  }
  // Subscription lifecycle events are sufficient for entitlement reconciliation.
  // Invoice payment events are not treated as proof of entitlement on their own.
  return null;
}

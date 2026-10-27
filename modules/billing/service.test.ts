// filename: modules/billing/service.test.ts
import { beforeEach, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { MemoryStore } from "../../tests/fixture/memory";
import { Organizations } from "../organizations/service";
import { Billing } from "./service";
import {
  verifyStripeEvent,
  type BillingProvider,
  type SubscriptionSnapshot,
  type VerifiedBillingEvent,
} from "./stripe";
const actor = {
  uid: "owner",
  email: "owner@example.test",
  emailVerified: true,
  name: "Owner",
};
let store: MemoryStore,
  organizations: Organizations,
  billing: Billing,
  id: string,
  snapshot: SubscriptionSnapshot,
  fail: boolean,
  calls: number;
beforeEach(async () => {
  process.env.APP_ENV = "preview";
  process.env.BILLING_MODE = "stripe";
  process.env.STRIPE_TEAM_PRICE_ID = "price_team";
  process.env.STRIPE_SECRET_KEY = "sk_test_not_a_real_key";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_only";
  store = new MemoryStore();
  organizations = new Organizations(store);
  id = await organizations.create(actor, {
    name: "Billing team",
    requestId: randomUUID(),
  });
  await store.insert("Subscription", {
    id,
    organizationId: id,
    provider: "stripe",
    plan: "free",
    status: "inactive",
    stripeCustomerId: "cus_test",
    stripeSubscriptionId: "sub_current",
    priceId: "",
    currentPeriodEnd: "",
    updatedAt: new Date().toISOString(),
  });
  snapshot = {
    id: "sub_current",
    customerId: "cus_test",
    organizationId: id,
    priceId: "price_team",
    active: true,
    status: "active",
    periodEnd: "",
  };
  fail = false;
  calls = 0;
  const provider: BillingProvider = {
    kind: "stripe",
    async change() {
      return { kind: "redirect", url: "https://checkout.stripe.com/test" };
    },
    async createCustomer() {
      return "cus_test";
    },
    async checkout() {
      return "https://checkout.stripe.com/test";
    },
    async portal() {
      return "https://billing.stripe.com/test";
    },
    async checkoutSubscription() {
      return { customerId: "cus_test", subscriptionId: "sub_current" };
    },
    async snapshot() {
      return snapshot;
    },
    async current() {
      calls++;
      if (fail) throw new Error("No network in tests");
      return snapshot;
    },
  };
  billing = new Billing(organizations, provider);
});
const event = (eventId = "evt_test", created = 100): VerifiedBillingEvent => ({
  id: eventId,
  type: "customer.subscription.updated",
  objectId: "sub_current",
  customerId: "cus_test",
  subscriptionId: "sub_current",
  created,
});
it("verifies signatures before accepting event content", () => {
  const body = JSON.stringify({
    id: "evt_signed",
    type: "customer.subscription.updated",
    created: 100,
    data: { object: { id: "sub_current", customer: "cus_test" } },
  });
  expect(() => verifyStripeEvent(body, "invalid")).toThrow();
  const stripe = new Stripe("sk_test_not_a_real_key");
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: "whsec_test_only",
  });
  expect(verifyStripeEvent(body, signature)?.id).toBe("evt_signed");
  expect(() => verifyStripeEvent(body + " ", signature)).toThrow();
});
it("ignores duplicate succeeded events without another entitlement update", async () => {
  expect(await billing.receive(event())).toBe(true);
  expect(await billing.receive(event())).toBe(true);
  expect(calls).toBe(1);
  expect((await store.get("BillingEvent", "evt_test"))?.attempts).toBe(1);
  expect((await organizations.usage(actor, id)).plan).toBe("team");
});
it("preserves failed attempts and safely recovers on retry", async () => {
  fail = true;
  expect(await billing.receive(event())).toBe(false);
  expect((await store.get("BillingEvent", "evt_test"))?.status).toBe("failed");
  expect((await organizations.usage(actor, id)).plan).toBe("free");
  fail = false;
  expect(await billing.retry(actor, id, "evt_test")).toBe(true);
  expect((await store.get("BillingEvent", "evt_test"))?.attempts).toBe(2);
  expect((await organizations.usage(actor, id)).plan).toBe("team");
});
it("reconciles current provider state for out-of-order events", async () => {
  await billing.receive(event("evt_new", 200));
  snapshot = { ...snapshot, active: false, status: "canceled" };
  await billing.receive(event("evt_old", 100));
  expect((await organizations.usage(actor, id)).plan).toBe("free");
});
it("never grants paid access for an unexpected price or customer", async () => {
  snapshot = { ...snapshot, priceId: "price_unrecognized" };
  await billing.receive(event());
  expect((await organizations.usage(actor, id)).plan).toBe("free");
  snapshot = { ...snapshot, customerId: "cus_other", priceId: "price_team" };
  expect(await billing.receive(event("evt_other"))).toBe(false);
  expect((await organizations.usage(actor, id)).plan).toBe("free");
});
it("serializes concurrent webhook processing and retries duplicates safely", async () => {
  const results = await Promise.allSettled([
    billing.receive(event()),
    billing.receive(event()),
  ]);
  expect(results.some((row) => row.status === "fulfilled" && row.value)).toBe(
    true,
  );
  expect(calls).toBe(1);
  expect(await billing.receive(event())).toBe(true);
  expect(calls).toBe(1);
});
it("does not accept a demonstration subscription as a Stripe customer", async () => {
  const row = (await store.get("Subscription", id))!;
  await store.update("Subscription", {
    ...row,
    provider: "demo",
    plan: "team",
  });
  await expect(billing.receive(event())).rejects.toMatchObject({ status: 409 });
  expect((await organizations.usage(actor, id)).plan).toBe("free");
});

it("returns a rejected signature without opening the application store", async () => {
  const { POST } = await import("../../app/api/stripe/webhook/route");
  const response = await POST(
    new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "invalid" },
      body: "{}",
    }),
  );
  expect(response.status).toBe(400);
  expect(await store.get("BillingEvent", "evt_test")).toBeNull();
});

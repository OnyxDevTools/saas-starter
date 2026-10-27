// filename: modules/billing/service.ts
import "server-only";
import { ensure } from "../../lib/errors";
import { exclusively } from "../../lib/locks";
import { collect } from "../../lib/onyx/store";
import type { Actor, Rows } from "../models";
import { Organizations } from "../organizations/service";
import { DemonstrationProvider } from "./demo";
import { billingMode, requireDemonstration } from "./plans";
import {
  StripeProvider,
  type BillingProvider,
  type VerifiedBillingEvent,
} from "./stripe";
export class Billing {
  constructor(
    private readonly organizations: Organizations,
    private readonly injectedProvider?: BillingProvider,
  ) {}
  private provider() {
    return this.injectedProvider || new StripeProvider();
  }
  private empty(organizationId: string): Rows["Subscription"] {
    return {
      id: organizationId,
      organizationId,
      provider: "free",
      plan: "free",
      status: "active",
      stripeCustomerId: "",
      stripeSubscriptionId: "",
      priceId: "",
      currentPeriodEnd: "",
      updatedAt: new Date().toISOString(),
    };
  }
  async demo(actor: Actor, organizationId: string, plan: "free" | "team") {
    requireDemonstration();
    return this.organizations.locked(
      actor,
      organizationId,
      "billing",
      "demonstration-plan",
      async () => {
        const current = await this.organizations.store.get(
          "Subscription",
          organizationId,
        );
        ensure(
          current?.provider !== "stripe",
          409,
          "A Stripe subscription cannot be replaced by demonstration billing.",
        );
        const result = await new DemonstrationProvider().change(
          current || this.empty(organizationId),
          plan,
        );
        const row = result.subscription;
        if (current) await this.organizations.store.update("Subscription", row);
        else await this.organizations.store.insert("Subscription", row);
        await this.organizations.audit(
          actor,
          organizationId,
          "billing.demonstration-changed",
          organizationId,
        );
      },
    );
  }
  async checkout(actor: Actor, organizationId: string) {
    ensure(billingMode() === "stripe", 409, "Stripe billing is not enabled.");
    return this.organizations.locked(
      actor,
      organizationId,
      "billing",
      "stripe-checkout",
      async () => {
        let current = await this.organizations.store.get(
          "Subscription",
          organizationId,
        );
        ensure(
          current?.provider !== "demo",
          409,
          "Remove the demonstration subscription in a development database before enabling Stripe.",
        );
        const provider = this.provider();
        if (!current?.stripeCustomerId) {
          const customerId = await provider.createCustomer(
            organizationId,
            actor.email,
          );
          const row = {
            ...(current || this.empty(organizationId)),
            provider: "stripe" as const,
            stripeCustomerId: customerId,
            updatedAt: new Date().toISOString(),
          };
          if (current)
            await this.organizations.store.update("Subscription", row);
          else await this.organizations.store.insert("Subscription", row);
          current = row;
        }
        const result = await provider.change(current, "team");
        ensure(
          result.kind === "redirect",
          503,
          "Stripe did not return a checkout destination.",
        );
        return result.url;
      },
    );
  }
  async portal(actor: Actor, organizationId: string) {
    await this.organizations.access(actor, organizationId, "billing");
    ensure(billingMode() === "stripe", 409, "Stripe billing is not enabled.");
    const row = await this.organizations.store.get(
      "Subscription",
      organizationId,
    );
    ensure(
      row?.provider === "stripe" && row.stripeCustomerId,
      409,
      "No Stripe customer exists for this organization.",
    );
    return this.provider().portal(row.stripeCustomerId);
  }
  async receive(event: VerifiedBillingEvent) {
    ensure(billingMode() === "stripe", 409, "Stripe billing is not enabled.");
    const subscriptions = await collect(
      this.organizations.store,
      "Subscription",
      { stripeCustomerId: event.customerId, provider: "stripe" },
    );
    ensure(
      subscriptions.length === 1,
      409,
      "The Stripe customer is not linked to one organization.",
    );
    const organizationId = subscriptions[0]!.organizationId;
    return exclusively(
      this.organizations.store,
      `organization:${organizationId}`,
      "stripe-webhook",
      async () => {
        let row = await this.organizations.store.get("BillingEvent", event.id);
        if (row) {
          ensure(
            row.organizationId === organizationId &&
              row.customerId === event.customerId,
            409,
            "Billing event linkage mismatch.",
          );
          if (row.status === "succeeded") return true;
        } else {
          const now = new Date().toISOString();
          row = {
            id: event.id,
            organizationId,
            type: event.type,
            objectId: event.objectId,
            customerId: event.customerId,
            subscriptionId: event.subscriptionId,
            eventCreated: new Date(event.created * 1000).toISOString(),
            status: "received",
            attempts: 0,
            failureCode: "",
            createdAt: now,
            updatedAt: now,
          };
          await this.organizations.store.insert("BillingEvent", row);
        }
        return this.process(row);
      },
    );
  }
  private async process(row: Rows["BillingEvent"]) {
    const processing = {
      ...row,
      status: "processing" as const,
      attempts: row.attempts + 1,
      failureCode: "",
      updatedAt: new Date().toISOString(),
    };
    await this.organizations.store.update("BillingEvent", processing);
    let snapshot;
    try {
      const provider = this.provider();
      let id = row.subscriptionId;
      if (row.type === "checkout.session.completed") {
        const session = await provider.checkoutSubscription(row.objectId);
        ensure(
          session.customerId === row.customerId,
          409,
          "Checkout customer mismatch.",
        );
        id = session.subscriptionId;
      }
      ensure(id, 422, "No subscription to reconcile.");
      snapshot = await provider.current(row.customerId, row.organizationId);
      ensure(
        snapshot.customerId === row.customerId &&
          snapshot.organizationId === row.organizationId,
        409,
        "Subscription linkage mismatch.",
      );
    } catch {
      await this.organizations.store.update("BillingEvent", {
        ...processing,
        status: "failed",
        failureCode: "stripe-reconciliation-failed",
        updatedAt: new Date().toISOString(),
      });
      return false;
    }
    const current = await this.organizations.store.get(
      "Subscription",
      row.organizationId,
    );
    ensure(
      current &&
        current.provider === "stripe" &&
        current.stripeCustomerId === snapshot.customerId,
      409,
      "Subscription linkage changed.",
    );
    const eligible =
      snapshot.active && snapshot.priceId === process.env.STRIPE_TEAM_PRICE_ID;
    await this.organizations.store.update("Subscription", {
      ...current,
      stripeSubscriptionId: snapshot.id,
      plan: eligible ? "team" : "free",
      status: snapshot.status,
      priceId: snapshot.priceId,
      currentPeriodEnd: snapshot.periodEnd,
      updatedAt: new Date().toISOString(),
    });
    await this.organizations.store.update("BillingEvent", {
      ...processing,
      status: "succeeded",
      subscriptionId: snapshot.id,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }
  async retry(actor: Actor, organizationId: string, eventId: string) {
    ensure(billingMode() === "stripe", 409, "Stripe billing is not enabled.");
    return this.organizations.locked(
      actor,
      organizationId,
      "billing",
      "retry-billing-event",
      async () => {
        const row = await this.organizations.store.get("BillingEvent", eventId);
        ensure(
          row && row.organizationId === organizationId,
          404,
          "Billing event not found.",
        );
        if (row.status === "succeeded") return true;
        return this.process(row);
      },
    );
  }
  async reconcile(actor: Actor, organizationId: string) {
    ensure(billingMode() === "stripe", 409, "Stripe billing is not enabled.");
    return this.organizations.locked(
      actor,
      organizationId,
      "billing",
      "reconcile-subscription",
      async () => {
        const current = await this.organizations.store.get(
          "Subscription",
          organizationId,
        );
        ensure(
          current?.provider === "stripe" && current.stripeSubscriptionId,
          409,
          "No Stripe subscription exists.",
        );
        const snapshot = await this.provider().current(
          current.stripeCustomerId,
          organizationId,
        );
        ensure(
          snapshot.customerId === current.stripeCustomerId &&
            snapshot.organizationId === organizationId,
          409,
          "Stripe linkage mismatch.",
        );
        await this.organizations.store.update("Subscription", {
          ...current,
          plan:
            snapshot.active &&
            snapshot.priceId === process.env.STRIPE_TEAM_PRICE_ID
              ? "team"
              : "free",
          status: snapshot.status,
          priceId: snapshot.priceId,
          currentPeriodEnd: snapshot.periodEnd,
          updatedAt: new Date().toISOString(),
        });
      },
    );
  }
  async events(actor: Actor, organizationId: string) {
    await this.organizations.access(actor, organizationId, "billing");
    return collect(this.organizations.store, "BillingEvent", {
      organizationId,
    });
  }
}

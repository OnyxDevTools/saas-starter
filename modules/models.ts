// filename: modules/models.ts
import { z } from "zod";
import type { OnyxSchema } from "../lib/onyx/generated";
const id = z.string().min(1).max(256);
const date = z.iso.datetime({ offset: true });
export const roleSchema = z.enum(["owner", "admin", "member"]);
export type Role = z.infer<typeof roleSchema>;
export const schemas = {
  Profile: z.object({
    id,
    email: z.email(),
    name: z.string().min(1).max(80),
    createdAt: date,
    updatedAt: date,
  }),
  Organization: z.object({
    id,
    name: z.string().min(1).max(80),
    createdBy: id,
    createdAt: date,
    updatedAt: date,
  }),
  Membership: z.object({
    id,
    organizationId: id,
    userId: id,
    email: z.email(),
    name: z.string().max(80),
    role: roleSchema,
    status: z.enum(["active", "removed"]),
    createdAt: date,
    updatedAt: date,
  }),
  Invitation: z.object({
    id,
    organizationId: id,
    email: z.email(),
    role: z.enum(["admin", "member"]),
    tokenHash: z.string().length(64),
    expiresAt: date,
    status: z.enum(["pending", "accepted", "revoked"]),
    acceptedBy: z.string(),
    createdBy: id,
    createdAt: date,
    updatedAt: date,
  }),
  Project: z.object({
    id,
    organizationId: id,
    name: z.string().min(1).max(120),
    description: z.string().max(2000),
    status: z.enum(["active", "archived"]),
    createdBy: id,
    createdAt: date,
    updatedAt: date,
  }),
  Subscription: z.object({
    id,
    organizationId: id,
    provider: z.enum(["free", "demo", "stripe"]),
    plan: z.enum(["free", "team"]),
    status: z.enum(["active", "inactive", "past_due", "canceled"]),
    stripeCustomerId: z.string(),
    stripeSubscriptionId: z.string(),
    priceId: z.string(),
    currentPeriodEnd: z.string(),
    updatedAt: date,
  }),
  BillingEvent: z.object({
    id,
    organizationId: id,
    type: z.string(),
    objectId: z.string(),
    customerId: z.string(),
    subscriptionId: z.string(),
    eventCreated: date,
    status: z.enum(["received", "processing", "succeeded", "failed"]),
    attempts: z.number().int().nonnegative(),
    failureCode: z.string(),
    createdAt: date,
    updatedAt: date,
  }),
  Notification: z.object({
    id,
    organizationId: id,
    invitationId: id,
    recipient: z.email(),
    encryptedToken: z.string(),
    channel: z.enum(["outbox", "smtp"]),
    status: z.enum(["pending", "sending", "sent", "failed"]),
    attempts: z.number().int().nonnegative(),
    failureCode: z.string(),
    createdAt: date,
    updatedAt: date,
  }),
  AuditEvent: z.object({
    id,
    organizationId: id,
    actorId: id,
    actorName: z.string(),
    action: z.string(),
    subjectId: z.string(),
    createdAt: date,
  }),
  MutationLock: z.object({ id, operation: z.string(), acquiredAt: date }),
} satisfies { [K in keyof OnyxSchema]: z.ZodType<OnyxSchema[K]> };
export type Rows = {
  [K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
};
export type Table = keyof Rows;
export type Actor = {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
};
export const organizationInput = z
  .object({
    name: z.string().trim().min(2, "Use at least two characters.").max(80),
    requestId: z.uuid(),
  })
  .strict();
export const projectInput = z
  .object({
    name: z.string().trim().min(2, "Use at least two characters.").max(120),
    description: z.string().trim().max(2000),
  })
  .strict();
export const invitationInput = z
  .object({
    email: z.email().transform((value) => value.toLowerCase()),
    role: z.enum(["admin", "member"]),
  })
  .strict();

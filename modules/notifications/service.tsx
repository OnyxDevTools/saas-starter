// filename: modules/notifications/service.tsx
import "server-only";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { ensure } from "../../lib/errors";
import { collect } from "../../lib/onyx/store";
import type { Actor, Rows } from "../models";
import { Organizations } from "../organizations/service";
import { decryptToken, encryptToken } from "./crypto";
import InvitationEmail from "./emails/invitation";
export interface Mailer {
  send(input: {
    recipient: string;
    subject: string;
    html: string;
    text: string;
    messageId: string;
  }): Promise<void>;
}
export function smtpMailer(): Mailer {
  const host = process.env.SMTP_HOST,
    user = process.env.SMTP_USER,
    password = process.env.SMTP_PASSWORD,
    from = process.env.MAIL_FROM;
  ensure(
    host && from,
    503,
    "Configure SMTP_HOST and MAIL_FROM before SMTP delivery.",
  );
  const port = Number(process.env.SMTP_PORT || 587);
  ensure(
    Number.isInteger(port) && port > 0 && port < 65536,
    503,
    "Invalid SMTP_PORT.",
  );
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    ...(user && password ? { auth: { user, pass: password } } : {}),
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
  return {
    async send(input) {
      await transport.sendMail({
        from,
        to: input.recipient,
        subject: input.subject,
        html: input.html,
        text: input.text,
        messageId: input.messageId,
      });
    },
  };
}
export class Notifications {
  constructor(
    private readonly organizations: Organizations,
    private readonly mailer?: Mailer,
  ) {}
  prepare(invitation: Rows["Invitation"], token: string): Rows["Notification"] {
    const now = new Date().toISOString();
    return {
      id: invitation.id,
      organizationId: invitation.organizationId,
      invitationId: invitation.id,
      recipient: invitation.email,
      encryptedToken: encryptToken(token),
      channel: process.env.MAIL_MODE === "smtp" ? "smtp" : "outbox",
      status: "pending",
      attempts: 0,
      failureCode: "",
      createdAt: now,
      updatedAt: now,
    };
  }
  async preview(actor: Actor, organizationId: string, id: string) {
    const { organization } = await this.organizations.access(
      actor,
      organizationId,
      "team",
    );
    const notification = await this.organizations.store.get("Notification", id);
    ensure(
      notification && notification.organizationId === organizationId,
      404,
      "Notification not found.",
    );
    const invitation = await this.organizations.store.get(
      "Invitation",
      notification.invitationId,
    );
    ensure(
      invitation &&
        invitation.organizationId === organizationId &&
        invitation.status === "pending" &&
        Date.parse(invitation.expiresAt) > Date.now(),
      410,
      "This invitation is no longer available.",
    );
    const origin = new URL(process.env.APP_ORIGIN || "http://127.0.0.1:3000");
    ensure(
      ["http:", "https:"].includes(origin.protocol) &&
        !origin.username &&
        !origin.password,
      503,
      "Configure a valid APP_ORIGIN.",
    );
    const url = new URL(`/invite/${invitation.id}`, origin);
    url.searchParams.set("token", decryptToken(notification.encryptedToken));
    const html = await render(
      <InvitationEmail
        organization={organization.name}
        recipient={notification.recipient}
        url={url.href}
      />,
    );
    return {
      notification,
      html,
      url: url.href,
      text: `Join ${organization.name}: ${url.href}`,
    };
  }
  async outbox(actor: Actor, organizationId: string) {
    await this.organizations.access(actor, organizationId, "team");
    return (
      await collect(this.organizations.store, "Notification", {
        organizationId,
      })
    )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        recipient: item.recipient,
        status: item.status,
        channel: item.channel,
        attempts: item.attempts,
        createdAt: item.createdAt,
      }));
  }
  async deliver(actor: Actor, organizationId: string, id: string) {
    ensure(
      process.env.MAIL_MODE === "smtp",
      409,
      "SMTP is disabled. Use the authenticated invitation preview in the outbox.",
    );
    await this.organizations.access(actor, organizationId, "team");
    const mailer = this.mailer || smtpMailer();
    return this.organizations.locked(
      actor,
      organizationId,
      "team",
      "deliver-invitation",
      async () => {
        const preview = await this.preview(actor, organizationId, id);
        const current = await this.organizations.store.get("Notification", id);
        ensure(
          current && current.organizationId === organizationId,
          404,
          "Notification not found.",
        );
        if (current.status === "sent") return true;
        ensure(
          current.status !== "sending",
          409,
          "A previous send has an uncertain result. Review it before retrying.",
        );
        const sending = {
          ...current,
          status: "sending" as const,
          channel: "smtp" as const,
          attempts: current.attempts + 1,
          updatedAt: new Date().toISOString(),
        };
        await this.organizations.store.update("Notification", sending);
        try {
          await mailer.send({
            recipient: current.recipient,
            subject: "Your workspace invitation",
            html: preview.html,
            text: preview.text,
            messageId: `<invitation-${id}@saas-starter.local>`,
          });
        } catch {
          await this.organizations.store.update("Notification", {
            ...sending,
            status: "failed",
            failureCode: "smtp-delivery-failed",
            updatedAt: new Date().toISOString(),
          });
          return false;
        }
        await this.organizations.store.update("Notification", {
          ...sending,
          status: "sent",
          failureCode: "",
          updatedAt: new Date().toISOString(),
        });
        return true;
      },
    );
  }
}

// filename: modules/organizations/service.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { MemoryStore } from "../../tests/fixture/memory";
import { Organizations } from "./service";
import { Invitations } from "./invitations";
import { Projects } from "../projects/service";
import { Notifications } from "../notifications/service";
import { Billing } from "../billing/service";
import type { Actor } from "../models";
const owner: Actor = {
    uid: "owner",
    email: "owner@example.test",
    emailVerified: true,
    name: "Owner",
  },
  guest: Actor = {
    uid: "guest",
    email: "guest@example.test",
    emailVerified: true,
    name: "Guest",
  };
let store: MemoryStore,
  organizations: Organizations,
  projects: Projects,
  notifications: Notifications,
  invitations: Invitations,
  organizationId: string;
beforeEach(async () => {
  process.env.NOTIFICATION_ENCRYPTION_KEY = Buffer.alloc(32, 1).toString(
    "base64",
  );
  process.env.APP_ORIGIN = "http://localhost:3000";
  process.env.APP_ENV = "preview";
  process.env.BILLING_MODE = "demo";
  process.env.ALLOW_DEMO_BILLING = "1";
  process.env.MAIL_MODE = "outbox";
  store = new MemoryStore();
  organizations = new Organizations(store);
  projects = new Projects(organizations);
  notifications = new Notifications(organizations);
  invitations = new Invitations(organizations, notifications);
  organizationId = await organizations.create(owner, {
    name: "Owner team",
    requestId: randomUUID(),
  });
});
describe("organization isolation and invariants", () => {
  it("rejects cross-organization reads, IDs and aggregates", async () => {
    const other = await organizations.create(guest, {
      name: "Other team",
      requestId: randomUUID(),
    });
    const id = await projects.create(
      guest,
      other,
      { name: "Private project", description: "" },
      randomUUID(),
    );
    await expect(projects.list(owner, other)).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      projects.update(owner, organizationId, id, {
        name: "Stolen",
        description: "",
      }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(organizations.snapshot(owner, other)).rejects.toMatchObject({
      status: 403,
    });
    await expect(notifications.outbox(owner, other)).rejects.toMatchObject({
      status: 403,
    });
  });
  it("enforces roles, last-owner protection, and departure", async () => {
    await expect(
      organizations.changeMember(owner, organizationId, owner.uid, "removed"),
    ).rejects.toMatchObject({ status: 409 });
    const id = await invitations.create(owner, organizationId, {
      email: guest.email,
      role: "member",
    });
    const token = new URL(
      (await notifications.preview(owner, organizationId, id)).url,
    ).searchParams.get("token")!;
    await invitations.accept(guest, id, token);
    await expect(
      organizations.rename(guest, organizationId, "Denied"),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      invitations.create(guest, organizationId, {
        email: "x@example.test",
        role: "member",
      }),
    ).rejects.toMatchObject({ status: 403 });
    await organizations.changeMember(owner, organizationId, guest.uid, "owner");
    await organizations.changeMember(
      owner,
      organizationId,
      owner.uid,
      "removed",
    );
    expect(
      (await organizations.team(guest, organizationId)).filter(
        (row) => row.role === "owner",
      ),
    ).toHaveLength(1);
  });
  it("serializes concurrent owner departures across service instances", async () => {
    const id = await invitations.create(owner, organizationId, {
      email: guest.email,
      role: "member",
    });
    const token = new URL(
      (await notifications.preview(owner, organizationId, id)).url,
    ).searchParams.get("token")!;
    await invitations.accept(guest, id, token);
    await organizations.changeMember(owner, organizationId, guest.uid, "owner");
    const second = new Organizations(store);
    const results = await Promise.allSettled([
      organizations.changeMember(owner, organizationId, owner.uid, "removed"),
      second.changeMember(guest, organizationId, guest.uid, "removed"),
    ]);
    expect(results.filter((row) => row.status === "fulfilled")).toHaveLength(1);
    expect(
      (
        await organizations.team(
          results[0]?.status === "fulfilled" ? guest : owner,
          organizationId,
        )
      ).filter((row) => row.role === "owner"),
    ).toHaveLength(1);
  });
  it("enforces project and seat limits, including pending invitations", async () => {
    for (let i = 0; i < 3; i++)
      await projects.create(
        owner,
        organizationId,
        { name: `Project ${i}`, description: "" },
        randomUUID(),
      );
    await expect(
      projects.create(
        owner,
        organizationId,
        { name: "Too many", description: "" },
        randomUUID(),
      ),
    ).rejects.toMatchObject({ status: 409 });
    await invitations.create(owner, organizationId, {
      email: "a@example.test",
      role: "member",
    });
    await invitations.create(owner, organizationId, {
      email: "b@example.test",
      role: "member",
    });
    await expect(
      invitations.create(owner, organizationId, {
        email: "c@example.test",
        role: "member",
      }),
    ).rejects.toMatchObject({ status: 409 });
    const first = (await projects.list(owner, organizationId))[0]!;
    await projects.update(
      owner,
      organizationId,
      first.id,
      { name: first.name, description: first.description },
      true,
    );
    await projects.create(
      owner,
      organizationId,
      { name: "Replacement", description: "" },
      randomUUID(),
    );
    expect((await organizations.usage(owner, organizationId)).projects).toBe(3);
  });
  it("lets only one concurrent project claim the last entitlement", async () => {
    for (let i = 0; i < 2; i++)
      await projects.create(
        owner,
        organizationId,
        { name: `Existing ${i}`, description: "" },
        randomUUID(),
      );
    const results = await Promise.allSettled([
      projects.create(
        owner,
        organizationId,
        { name: "First", description: "" },
        randomUUID(),
      ),
      new Projects(new Organizations(store)).create(
        owner,
        organizationId,
        { name: "Second", description: "" },
        randomUUID(),
      ),
    ]);
    expect(results.filter((row) => row.status === "fulfilled")).toHaveLength(1);
    expect((await organizations.usage(owner, organizationId)).projects).toBe(3);
  });
  it("retains locks after uncertain writes rather than unsafe automatic takeover", async () => {
    store.failNextUpdate = true;
    await expect(
      organizations.rename(owner, organizationId, "Changed"),
    ).rejects.toMatchObject({ status: 503 });
    expect(
      await store.get("MutationLock", `organization:${organizationId}`),
    ).not.toBeNull();
    await expect(
      organizations.rename(owner, organizationId, "Again"),
    ).rejects.toMatchObject({ status: 409 });
  });
  it("preserves edited sample records when a request is replayed", async () => {
    const requestId = randomUUID(),
      id = await projects.create(
        owner,
        organizationId,
        { name: "Original", description: "" },
        requestId,
      );
    await projects.update(owner, organizationId, id, {
      name: "User edit",
      description: "Kept",
    });
    await projects.create(
      owner,
      organizationId,
      { name: "Original", description: "" },
      requestId,
    );
    expect((await store.get("Project", id))?.name).toBe("User edit");
  });
});
describe("invitations", () => {
  it("requires matching verified email, hashes tokens, and consumes once with safe replay", async () => {
    const id = await invitations.create(owner, organizationId, {
        email: guest.email,
        role: "member",
      }),
      preview = await notifications.preview(owner, organizationId, id),
      token = new URL(preview.url).searchParams.get("token")!;
    const row = await store.get("Invitation", id);
    expect(row?.tokenHash).not.toContain(token);
    expect((await store.get("Notification", id))?.encryptedToken).not.toContain(
      token,
    );
    await expect(
      invitations.accept({ ...guest, emailVerified: false }, id, token),
    ).rejects.toMatchObject({ status: 403 });
    await expect(invitations.accept(owner, id, token)).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      invitations.accept(guest, id, "x".repeat(43)),
    ).rejects.toMatchObject({ status: 404 });
    expect(await invitations.accept(guest, id, token)).toBe(organizationId);
    expect(await invitations.accept(guest, id, token)).toBe(organizationId);
    expect(
      (await organizations.team(owner, organizationId)).filter(
        (row) => row.userId === guest.uid,
      ),
    ).toHaveLength(1);
    expect((await store.get("Notification", id))?.encryptedToken).toBe("");
  });
  it("rejects expiry and revocation, and expires seat reservations", async () => {
    const id = await invitations.create(owner, organizationId, {
        email: guest.email,
        role: "member",
      }),
      token = new URL(
        (await notifications.preview(owner, organizationId, id)).url,
      ).searchParams.get("token")!;
    const row = (await store.get("Invitation", id))!;
    await store.update("Invitation", {
      ...row,
      expiresAt: new Date(Date.now() - 1).toISOString(),
    });
    await expect(invitations.accept(guest, id, token)).rejects.toMatchObject({
      status: 410,
    });
    expect((await organizations.usage(owner, organizationId)).pending).toBe(0);
    const another = await invitations.create(owner, organizationId, {
        email: guest.email,
        role: "member",
      }),
      next = new URL(
        (await notifications.preview(owner, organizationId, another)).url,
      ).searchParams.get("token")!;
    await invitations.revoke(owner, organizationId, another);
    await expect(
      invitations.accept(guest, another, next),
    ).rejects.toMatchObject({ status: 410 });
  });
  it("prevents replay from reactivating a departed membership", async () => {
    const id = await invitations.create(owner, organizationId, {
        email: guest.email,
        role: "member",
      }),
      token = new URL(
        (await notifications.preview(owner, organizationId, id)).url,
      ).searchParams.get("token")!;
    await invitations.accept(guest, id, token);
    await organizations.changeMember(
      guest,
      organizationId,
      guest.uid,
      "removed",
    );
    await expect(invitations.accept(guest, id, token)).rejects.toMatchObject({
      status: 410,
    });
  });
  it("does not send SMTP in outbox mode", async () => {
    let sends = 0;
    const mail = new Notifications(organizations, {
        async send() {
          sends++;
        },
      }),
      invites = new Invitations(organizations, mail);
    const id = await invites.create(owner, organizationId, {
      email: guest.email,
      role: "member",
    });
    await expect(mail.deliver(owner, organizationId, id)).rejects.toMatchObject(
      { status: 409 },
    );
    expect(sends).toBe(0);
  });
  it("keeps demonstration billing explicit and distinct from Stripe", async () => {
    const billing = new Billing(organizations);
    await billing.demo(owner, organizationId, "team");
    expect(
      (await organizations.usage(owner, organizationId)).limits.projects,
    ).toBe(50);
    process.env.BILLING_MODE = "stripe";
    expect((await organizations.usage(owner, organizationId)).plan).toBe(
      "free",
    );
    await expect(
      billing.demo(owner, organizationId, "team"),
    ).rejects.toMatchObject({ status: 403 });
    process.env.BILLING_MODE = "demo";
    process.env.APP_ENV = "production";
    expect((await organizations.usage(owner, organizationId)).plan).toBe(
      "free",
    );
    await expect(
      billing.demo(owner, organizationId, "team"),
    ).rejects.toMatchObject({ status: 403 });
  });
});

it("does not overbook the final seat under concurrent invitations", async () => {
  await invitations.create(owner, organizationId, {
    email: "reserved@example.test",
    role: "member",
  });
  const second = new Invitations(
    new Organizations(store),
    new Notifications(new Organizations(store)),
  );
  const results = await Promise.allSettled([
    invitations.create(owner, organizationId, {
      email: "first@example.test",
      role: "member",
    }),
    second.create(owner, organizationId, {
      email: "second@example.test",
      role: "member",
    }),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  expect((await organizations.usage(owner, organizationId)).seats).toBe(3);
});

it("serializes simultaneous acceptance of the same one-time invitation", async () => {
  const id = await invitations.create(owner, organizationId, {
    email: guest.email,
    role: "member",
  });
  const token = new URL(
    (await notifications.preview(owner, organizationId, id)).url,
  ).searchParams.get("token")!;
  const results = await Promise.allSettled([
    invitations.accept(guest, id, token),
    invitations.accept(guest, id, token),
  ]);
  expect(results.some((result) => result.status === "fulfilled")).toBe(true);
  expect(
    (await organizations.team(owner, organizationId)).filter(
      (member) => member.userId === guest.uid,
    ),
  ).toHaveLength(1);
  expect(await invitations.accept(guest, id, token)).toBe(organizationId);
});

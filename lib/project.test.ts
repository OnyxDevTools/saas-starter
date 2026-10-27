// filename: lib/project.test.ts
import { describe, expect, it } from "vitest";
import { projectIdentitySchema } from "./project";

describe("project identity", () => {
  it("normalizes display names without changing the namespace", () => {
    expect(
      projectIdentitySchema.parse({
        name: "  Inventory Admin  ",
        slug: "inventory-admin",
      }),
    ).toEqual({ name: "Inventory Admin", slug: "inventory-admin" });
  });
  it.each([
    "../escape",
    "Uppercase",
    "two--hyphens",
    "-leading",
    "trailing-",
    "",
    "1first",
  ])("rejects unsafe namespace %s", (slug) => {
    expect(
      projectIdentitySchema.safeParse({ name: "Inventory", slug }).success,
    ).toBe(false);
  });
  it("rejects blank names and unexpected fields", () => {
    expect(
      projectIdentitySchema.safeParse({ name: " ", slug: "admin" }).success,
    ).toBe(false);
    expect(
      projectIdentitySchema.safeParse({
        name: "Admin",
        slug: "admin",
        token: "secret",
      }).success,
    ).toBe(false);
  });
});

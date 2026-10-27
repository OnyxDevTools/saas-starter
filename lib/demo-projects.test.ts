// filename: lib/demo-projects.test.ts
import { describe, expect, it } from "vitest";
import { demoProjectSchema, initialProjects } from "./demo-projects";

describe("demo project validation", () => {
  it("accepts the seeded records and trims submitted values", () => {
    for (const { id, ...values } of initialProjects) {
      expect(id.length).toBeGreaterThan(0);
      expect(demoProjectSchema.parse(values)).toEqual(values);
    }
    expect(
      demoProjectSchema.parse({
        name: "  Portal ",
        owner: " alex@example.com ",
        status: "Active",
      }).name,
    ).toBe("Portal");
  });
  it("rejects invalid names, email addresses, and statuses", () => {
    expect(
      demoProjectSchema.safeParse({
        name: " ",
        owner: "bad",
        status: "Unknown",
      }).success,
    ).toBe(false);
  });
});

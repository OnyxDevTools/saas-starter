// filename: lib/format-date.test.ts
import { describe, expect, it } from "vitest";

import { formatDisplayDate } from "@/lib/format-date";

describe("formatDisplayDate", () => {
  it("formats a Date with the default display pattern", () => {
    expect(formatDisplayDate(new Date(2026, 6, 18))).toBe("Jul 18, 2026");
  });

  it("formats an ISO calendar date string", () => {
    expect(formatDisplayDate("2026-01-05")).toBe("Jan 5, 2026");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDisplayDate("not-a-date")).toBe("");
  });

  it("accepts a custom pattern", () => {
    expect(formatDisplayDate(new Date(2026, 0, 5), "yyyy-MM-dd")).toBe(
      "2026-01-05",
    );
  });
});

// filename: lib/format-date.ts
import { format, isValid, parseISO } from "date-fns";

/** Display pattern for compact table and list timestamps. */
export const DISPLAY_DATE_PATTERN = "MMM d, yyyy";

/**
 * Formats a Date or ISO-8601 string for UI display.
 * Returns an empty string for invalid input so callers can render a fallback.
 */
export function formatDisplayDate(
  value: Date | string,
  pattern: string = DISPLAY_DATE_PATTERN,
): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    return "";
  }
  return format(date, pattern);
}

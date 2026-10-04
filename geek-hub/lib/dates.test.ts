import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "./dates";

const now = new Date("2026-06-15T12:00:00Z").getTime();

describe("formatRelativeDate", () => {
  it("shows 'just now' for the last minute", () => {
    expect(formatRelativeDate("2026-06-15T11:59:30Z", now)).toBe("just now");
  });

  it("uses the largest fitting unit", () => {
    expect(formatRelativeDate("2026-06-15T09:00:00Z", now)).toBe("3 hours ago");
    expect(formatRelativeDate("2026-06-14T12:00:00Z", now)).toBe("yesterday");
    expect(formatRelativeDate("2026-05-01T12:00:00Z", now)).toBe("last month");
  });

  it("switches to an absolute date after a year", () => {
    expect(formatRelativeDate("2024-03-02T12:00:00Z", now)).toBe("Mar 2, 2024");
  });
});

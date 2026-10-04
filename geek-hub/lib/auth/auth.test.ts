import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeNextPath";
import { USERNAME_PATTERN, usernameFromEmail } from "./username";

describe("safeNextPath", () => {
  it("allows internal paths", () => {
    expect(safeNextPath("/lists/abc?x=1", "/library")).toBe("/lists/abc?x=1");
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "", null, 42])(
    "rejects %s",
    (value) => {
      expect(safeNextPath(value, "/library")).toBe("/library");
    },
  );
});

describe("usernameFromEmail", () => {
  it("normalises the local part and adds a numeric suffix", () => {
    expect(usernameFromEmail("Jane.Doe+anime@example.com", () => 0.4821)).toBe("jane_doe_4821");
  });

  it("falls back to a default base for short or empty local parts", () => {
    expect(usernameFromEmail("a@x.com", () => 0)).toBe("otaku_0000");
    expect(usernameFromEmail(undefined, () => 0.5)).toBe("otaku_5000");
  });

  it("always matches the database username constraint", () => {
    for (const email of [
      "Very.Long.Name.With.Lots.Of.Parts@mail.com",
      "日本@mail.jp",
      "___@x.io",
      "x-y_z@q.com",
    ]) {
      expect(usernameFromEmail(email)).toMatch(USERNAME_PATTERN);
    }
  });
});

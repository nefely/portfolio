import { describe, expect, it } from "vitest";
import { MESSAGE_MAX_LENGTH, normalizeMessageBody, validateMessageBody } from "./message";

describe("validateMessageBody", () => {
  it("rejects empty and whitespace-only messages", () => {
    expect(validateMessageBody("")).toBe("messageEmpty");
    expect(validateMessageBody("   \n\t ")).toBe("messageEmpty");
  });

  it("accepts a normal message", () => {
    expect(validateMessageBody("Hello!")).toBeUndefined();
  });

  it("measures length after trimming", () => {
    const body = "a".repeat(MESSAGE_MAX_LENGTH);
    expect(validateMessageBody(`  ${body}  `)).toBeUndefined();
    expect(validateMessageBody(`${body}a`)).toBe("messageTooLong");
  });
});

describe("normalizeMessageBody", () => {
  it("trims surrounding whitespace but keeps inner newlines", () => {
    expect(normalizeMessageBody("  line 1\nline 2  ")).toBe("line 1\nline 2");
  });
});

import { describe, expect, it } from "vitest";
import { mapSupabaseAuthError, validateAuthForm, validateEmail, validatePassword } from "./auth";

describe("validateEmail", () => {
  it("accepts valid emails (with surrounding spaces)", () => {
    expect(validateEmail("olena@example.com")).toBeUndefined();
    expect(validateEmail("  olena@example.com  ")).toBeUndefined();
  });

  it("rejects malformed emails", () => {
    expect(validateEmail("")).toBe("emailInvalid");
    expect(validateEmail("olena")).toBe("emailInvalid");
    expect(validateEmail("olena@example")).toBe("emailInvalid");
    expect(validateEmail("ol ena@example.com")).toBe("emailInvalid");
  });
});

describe("validatePassword", () => {
  it("requires at least 8 characters", () => {
    expect(validatePassword("1234567")).toBe("passwordTooShort");
    expect(validatePassword("12345678")).toBeUndefined();
  });
});

describe("validateAuthForm", () => {
  it("returns an error per invalid field", () => {
    expect(validateAuthForm({ email: "bad", password: "short" })).toEqual({
      email: "emailInvalid",
      password: "passwordTooShort",
    });
    expect(validateAuthForm({ email: "a@b.co", password: "longenough" })).toEqual({});
  });
});

describe("mapSupabaseAuthError", () => {
  it("maps by error code", () => {
    expect(mapSupabaseAuthError({ code: "invalid_credentials" })).toBe("invalidCredentials");
    expect(mapSupabaseAuthError({ code: "user_already_exists" })).toBe("emailTaken");
    expect(mapSupabaseAuthError({ code: "email_not_confirmed" })).toBe("emailNotConfirmed");
    expect(mapSupabaseAuthError({ code: "over_email_send_rate_limit" })).toBe("rateLimited");
  });

  it("falls back to message matching when code is absent", () => {
    expect(mapSupabaseAuthError({ message: "Invalid login credentials" })).toBe(
      "invalidCredentials",
    );
    expect(mapSupabaseAuthError({ message: "User already registered" })).toBe("emailTaken");
  });

  it("returns unknown for anything else", () => {
    expect(mapSupabaseAuthError({ message: "Database exploded" })).toBe("unknown");
    expect(mapSupabaseAuthError({})).toBe("unknown");
  });
});

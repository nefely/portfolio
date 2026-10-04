import { describe, expect, it } from "vitest";
import { describeAuthError, validateAuthForm } from "./auth";
import { hasErrors, validateList, validateProfile, validateReview } from "./forms";

describe("validateAuthForm", () => {
  it("requires a valid email and 8+ char password on signup", () => {
    const errors = validateAuthForm({ email: "nope", password: "short" }, "signup");
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it("only requires a non-empty password on login (legacy shared accounts)", () => {
    expect(validateAuthForm({ email: "a@b.co", password: "123456" }, "login")).toEqual({});
    expect(validateAuthForm({ email: "a@b.co", password: "" }, "login").password).toBeDefined();
  });
});

describe("describeAuthError", () => {
  it("maps known Supabase errors to friendly copy", () => {
    expect(describeAuthError({ code: "invalid_credentials" })).toMatch(/wrong email or password/i);
    expect(describeAuthError({ message: "User already registered" })).toMatch(/already exists/i);
    expect(describeAuthError({ code: "over_email_send_rate_limit" })).toMatch(/too many/i);
  });

  it("falls back to a generic message", () => {
    expect(describeAuthError({ message: "kaboom" })).toMatch(/something went wrong/i);
  });
});

describe("validateReview", () => {
  it("requires a score and at least 20 characters", () => {
    expect(validateReview({ score: null, body: "too short" })).toEqual({
      score: expect.any(String),
      body: expect.any(String),
    });
    expect(
      hasErrors(validateReview({ score: 8, body: "A genuinely moving story about time." })),
    ).toBe(false);
  });

  it("ignores surrounding whitespace when counting", () => {
    expect(validateReview({ score: 5, body: `   ${"a".repeat(19)}   ` }).body).toBeDefined();
  });
});

describe("validateList", () => {
  it("requires a title", () => {
    expect(validateList({ title: "   ", description: "" }).title).toBeDefined();
    expect(hasErrors(validateList({ title: "Comfy", description: "" }))).toBe(false);
  });
});

describe("validateProfile", () => {
  it("enforces the username pattern", () => {
    expect(
      validateProfile({ username: "Bad Name", displayName: "", bio: "" }).username,
    ).toBeDefined();
    expect(hasErrors(validateProfile({ username: "good_name1", displayName: "", bio: "" }))).toBe(
      false,
    );
  });
});

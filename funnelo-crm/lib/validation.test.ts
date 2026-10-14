import { describe, expect, it } from "vitest";
import {
  hasErrors,
  normalizeDomain,
  validateActivity,
  validateCompany,
  validateContact,
  validateDeal,
} from "./validation";

describe("validateDeal", () => {
  it("requires a title", () => {
    expect(validateDeal({ title: null, value: null }).title).toBeDefined();
  });

  it("rejects negative and non-numeric amounts", () => {
    expect(validateDeal({ title: "A", value: "-5" }).value).toBeDefined();
    expect(validateDeal({ title: "A", value: "abc" }).value).toBeDefined();
  });

  it("accepts an empty amount and a normal one", () => {
    expect(hasErrors(validateDeal({ title: "A", value: null }))).toBe(false);
    expect(hasErrors(validateDeal({ title: "A", value: "12500" }))).toBe(false);
  });
});

describe("validateContact", () => {
  it("checks email format only when provided", () => {
    expect(validateContact({ first_name: "Ann", email: "nope" }).email).toBeDefined();
    expect(hasErrors(validateContact({ first_name: "Ann", email: null }))).toBe(false);
    expect(hasErrors(validateContact({ first_name: "Ann", email: "ann@acme.io" }))).toBe(false);
  });
});

describe("validateCompany / validateActivity", () => {
  it("requires the main field", () => {
    expect(validateCompany({ name: null, domain: null }).name).toBeDefined();
    expect(validateActivity({ subject: null }).subject).toBeDefined();
  });
});

describe("normalizeDomain", () => {
  it("strips protocol, www and path", () => {
    expect(normalizeDomain("https://www.Acme.com/pricing")).toBe("acme.com");
    expect(normalizeDomain("acme.io")).toBe("acme.io");
    expect(normalizeDomain(null)).toBeNull();
  });
});

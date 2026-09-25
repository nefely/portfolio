import { describe, expect, it } from "vitest";
import {
  isEmployerProfileShape,
  normalizeEmployerProfile,
  validateEmployerProfile,
  validateWebsite,
  type EmployerProfileValues,
} from "./employerProfile";

const VALID: EmployerProfileValues = {
  name: "BuildPro Europe",
  locationCode: "gdansk",
  website: "",
  about: "",
};

describe("validateWebsite", () => {
  it("allows empty and http(s) URLs", () => {
    expect(validateWebsite("")).toBeUndefined();
    expect(validateWebsite("https://buildpro.eu")).toBeUndefined();
    expect(validateWebsite("http://buildpro.eu/about")).toBeUndefined();
  });

  it("rejects other protocols and non-URLs (XSS in public href)", () => {
    expect(validateWebsite("javascript:alert(1)")).toBe("websiteInvalid");
    expect(validateWebsite("buildpro.eu")).toBe("websiteInvalid");
  });
});

describe("validateEmployerProfile", () => {
  it("accepts a valid profile", () => {
    expect(validateEmployerProfile(VALID)).toEqual({});
  });

  it("requires a name and a known city", () => {
    const forged = {
      ...VALID,
      name: "B",
      locationCode: "atlantis",
    } as unknown as EmployerProfileValues;
    expect(validateEmployerProfile(forged)).toEqual({
      name: "nameTooShort",
      locationCode: "invalidValue",
    });
  });
});

describe("isEmployerProfileShape", () => {
  it("checks field types", () => {
    expect(isEmployerProfileShape(VALID)).toBe(true);
    expect(isEmployerProfileShape({ ...VALID, website: null })).toBe(false);
    expect(isEmployerProfileShape("BuildPro")).toBe(false);
  });
});

describe("normalizeEmployerProfile", () => {
  it("trims and maps empty optionals to null", () => {
    expect(normalizeEmployerProfile({ ...VALID, name: "  BuildPro  " })).toEqual({
      name: "BuildPro",
      location_code: "gdansk",
      website: null,
      about: null,
    });
  });
});

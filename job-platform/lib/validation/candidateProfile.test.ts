import { describe, expect, it } from "vitest";
import {
  isCandidateProfileShape,
  normalizeCandidateProfile,
  parseSkills,
  validateCandidateProfile,
  type CandidateProfileValues,
} from "./candidateProfile";

const VALID: CandidateProfileValues = {
  name: "Олена Коваленко",
  headline: "Зварниця з досвідом 5 років",
  categories: ["construction"],
  locationCode: "warsaw",
  desiredEmploymentTypes: ["full-time"],
  desiredWorkFormats: ["onsite"],
  experienceLevel: "3-5",
  languages: [{ code: "uk", level: "native" }],
  skills: "MIG, TIG",
  about: "",
  salaryExpectationFrom: "",
  currency: "EUR",
  availableFrom: "",
  profileLocale: "uk",
  isPublic: true,
};

describe("validateCandidateProfile", () => {
  it("accepts a valid profile", () => {
    expect(validateCandidateProfile(VALID)).toEqual({});
  });

  it("requires name, headline and at least one category", () => {
    expect(
      validateCandidateProfile({ ...VALID, name: " A ", headline: "  ", categories: [] }),
    ).toEqual({
      name: "nameTooShort",
      headline: "headlineRequired",
      categories: "categoriesRequired",
    });
  });

  it("rejects values outside the taxonomies (forged requests)", () => {
    const forged = {
      ...VALID,
      categories: ["hacking"],
      locationCode: "atlantis",
      currency: "BTC",
    } as unknown as CandidateProfileValues;

    expect(validateCandidateProfile(forged)).toMatchObject({
      categories: "invalidValue",
      locationCode: "invalidValue",
      currency: "invalidValue",
    });
  });

  it("rejects duplicate languages", () => {
    const errors = validateCandidateProfile({
      ...VALID,
      languages: [
        { code: "uk", level: "native" },
        { code: "uk", level: "basic" },
      ],
    });
    expect(errors.languages).toBe("invalidValue");
  });

  it("validates salary and date formats", () => {
    expect(validateCandidateProfile({ ...VALID, salaryExpectationFrom: "12.5" })).toMatchObject({
      salaryExpectationFrom: "salaryInvalid",
    });
    expect(validateCandidateProfile({ ...VALID, availableFrom: "next week" })).toMatchObject({
      availableFrom: "dateInvalid",
    });
    expect(
      validateCandidateProfile({
        ...VALID,
        salaryExpectationFrom: "3500",
        availableFrom: "2026-10-01",
      }),
    ).toEqual({});
  });

  it("limits skills count", () => {
    const skills = Array.from({ length: 21 }, (_, i) => `skill${i}`).join(",");
    expect(validateCandidateProfile({ ...VALID, skills }).skills).toBe("skillsTooMany");
  });
});

describe("isCandidateProfileShape", () => {
  it("accepts form values", () => {
    expect(isCandidateProfileShape(VALID)).toBe(true);
  });

  it("rejects wrong types instead of throwing", () => {
    expect(isCandidateProfileShape(null)).toBe(false);
    expect(isCandidateProfileShape({ ...VALID, categories: "it" })).toBe(false);
    expect(isCandidateProfileShape({ ...VALID, languages: [{ code: 1 }] })).toBe(false);
    expect(isCandidateProfileShape({ ...VALID, isPublic: "yes" })).toBe(false);
  });
});

describe("parseSkills", () => {
  it("trims, drops empties and de-duplicates", () => {
    expect(parseSkills(" MIG, TIG ,, MIG ")).toEqual(["MIG", "TIG"]);
  });
});

describe("normalizeCandidateProfile", () => {
  it("maps empty optionals to null and drops currency without salary", () => {
    const row = normalizeCandidateProfile(VALID);
    expect(row).toMatchObject({
      about: null,
      salary_expectation_from: null,
      currency: null,
      available_from: null,
      skills: ["MIG", "TIG"],
    });
  });

  it("keeps currency when salary is set", () => {
    const row = normalizeCandidateProfile({
      ...VALID,
      salaryExpectationFrom: "3500",
      currency: "PLN",
    });
    expect(row.salary_expectation_from).toBe(3500);
    expect(row.currency).toBe("PLN");
  });
});

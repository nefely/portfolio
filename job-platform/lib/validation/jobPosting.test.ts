import { describe, expect, it } from "vitest";
import {
  isJobPostingShape,
  normalizeJobPosting,
  validateJobPosting,
  type JobPostingValues,
} from "./jobPosting";

const VALID: JobPostingValues = {
  title: "Зварник MIG/MAG",
  description: "Зварювання металоконструкцій на виробництві, графік 5/2.",
  category: "manufacturing",
  locationCode: "gdansk",
  employmentType: "full-time",
  workFormat: "onsite",
  experienceLevel: "1-3",
  requiredLanguages: ["pl"],
  salaryFrom: "",
  salaryTo: "",
  currency: "PLN",
};

describe("validateJobPosting", () => {
  it("accepts a valid posting", () => {
    expect(validateJobPosting(VALID)).toEqual({});
  });

  it("checks title and description length", () => {
    expect(validateJobPosting({ ...VALID, title: " ab ", description: "коротко" })).toEqual({
      title: "titleTooShort",
      description: "descriptionTooShort",
    });
    expect(validateJobPosting({ ...VALID, title: "x".repeat(121) }).title).toBe("titleTooLong");
  });

  it("validates salary numbers and range", () => {
    expect(validateJobPosting({ ...VALID, salaryFrom: "5000", salaryTo: "4000" })).toEqual({
      salaryTo: "salaryRange",
    });
    expect(validateJobPosting({ ...VALID, salaryFrom: "-1" })).toEqual({
      salaryFrom: "salaryInvalid",
    });
    expect(validateJobPosting({ ...VALID, salaryFrom: "4000", salaryTo: "5000" })).toEqual({});
    expect(validateJobPosting({ ...VALID, salaryTo: "5000" })).toEqual({});
  });

  it("rejects values outside the taxonomies (forged requests)", () => {
    const forged = {
      ...VALID,
      category: "hacking",
      employmentType: "forever",
      requiredLanguages: ["pl", "pl"],
    } as unknown as JobPostingValues;

    expect(validateJobPosting(forged)).toMatchObject({
      category: "invalidValue",
      employmentType: "invalidValue",
      requiredLanguages: "invalidValue",
    });
  });
});

describe("isJobPostingShape", () => {
  it("rejects wrong types instead of throwing", () => {
    expect(isJobPostingShape(VALID)).toBe(true);
    expect(isJobPostingShape(null)).toBe(false);
    expect(isJobPostingShape({ ...VALID, requiredLanguages: "pl" })).toBe(false);
    expect(isJobPostingShape({ ...VALID, salaryFrom: 5000 })).toBe(false);
  });
});

describe("normalizeJobPosting", () => {
  it("copies the single-language text into every locale key", () => {
    const row = normalizeJobPosting({ ...VALID, title: "  Зварник  " });
    expect(row.title).toEqual({ uk: "Зварник", en: "Зварник", pl: "Зварник" });
    expect(row.description.en).toBe(VALID.description);
  });

  it("drops currency when no salary is given", () => {
    expect(normalizeJobPosting(VALID)).toMatchObject({
      salary_from: null,
      salary_to: null,
      currency: null,
    });
    expect(normalizeJobPosting({ ...VALID, salaryTo: "5000" })).toMatchObject({
      salary_from: null,
      salary_to: 5000,
      currency: "PLN",
    });
  });
});

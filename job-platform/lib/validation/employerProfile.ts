import { LOCATION_CODES } from "@/data/locations";
import type { LocationCode } from "@/types/location";

export const EMPLOYER_ABOUT_MAX_LENGTH = 2000;

export interface EmployerProfileValues {
  name: string;
  locationCode: LocationCode;
  website: string;
  about: string;
}

export type EmployerProfileErrorKey =
  "nameTooShort" | "websiteInvalid" | "aboutTooLong" | "invalidValue";

export type EmployerProfileErrors = Partial<
  Record<keyof EmployerProfileValues, EmployerProfileErrorKey>
>;

export function validateWebsite(website: string): EmployerProfileErrorKey | undefined {
  const trimmed = website.trim();
  if (trimmed === "") return undefined;

  try {
    const url = new URL(trimmed);
    // Лише http(s): javascript:/data: у href на публічній сторінці — XSS.
    return url.protocol === "http:" || url.protocol === "https:" ? undefined : "websiteInvalid";
  } catch {
    return "websiteInvalid";
  }
}

// Див. isCandidateProfileShape — той самий захист від довільного JSON.
export function isEmployerProfileShape(value: unknown): value is EmployerProfileValues {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return ["name", "locationCode", "website", "about"].every((key) => typeof v[key] === "string");
}

export function validateEmployerProfile(values: EmployerProfileValues): EmployerProfileErrors {
  const errors: EmployerProfileErrors = {};

  if (values.name.trim().length < 2) errors.name = "nameTooShort";
  if (!(LOCATION_CODES as string[]).includes(values.locationCode)) {
    errors.locationCode = "invalidValue";
  }

  const websiteError = validateWebsite(values.website);
  if (websiteError) errors.website = websiteError;

  if (values.about.length > EMPLOYER_ABOUT_MAX_LENGTH) errors.about = "aboutTooLong";

  return errors;
}

export function normalizeEmployerProfile(values: EmployerProfileValues) {
  const website = values.website.trim();
  const about = values.about.trim();

  return {
    name: values.name.trim(),
    location_code: values.locationCode,
    website: website === "" ? null : website,
    about: about === "" ? null : about,
  };
}

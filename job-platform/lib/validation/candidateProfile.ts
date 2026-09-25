import { CATEGORY_IDS } from "@/data/categories";
import { EMPLOYMENT_TYPE_IDS } from "@/data/employmentTypes";
import { EXPERIENCE_LEVEL_IDS } from "@/data/experienceLevels";
import { LANGUAGE_CODES } from "@/data/languages";
import { LANGUAGE_LEVELS } from "@/data/languageLevels";
import { LOCATION_CODES } from "@/data/locations";
import { WORK_FORMAT_IDS } from "@/data/workFormats";
import { routing } from "@/i18n/routing";
import type { CategoryId } from "@/types/category";
import type { CandidateLanguage } from "@/types/candidate";
import type { Currency, EmploymentType, ExperienceLevel, WorkFormat } from "@/types/job";
import type { AppLocale } from "@/types/i18n";
import type { LocationCode } from "@/types/location";

export const CURRENCIES: Currency[] = ["EUR", "PLN", "UAH"];

export const HEADLINE_MAX_LENGTH = 120;
export const ABOUT_MAX_LENGTH = 2000;
export const SKILLS_MAX_COUNT = 20;

// Стан форми кабінету: числа/дати — рядками (як в інпутах), skills — одним
// рядком через кому. Нормалізація в рядок БД — normalizeCandidateProfile.
export interface CandidateProfileValues {
  name: string;
  headline: string;
  categories: CategoryId[];
  locationCode: LocationCode;
  desiredEmploymentTypes: EmploymentType[];
  desiredWorkFormats: WorkFormat[];
  experienceLevel: ExperienceLevel;
  languages: CandidateLanguage[];
  skills: string;
  about: string;
  salaryExpectationFrom: string;
  currency: Currency;
  availableFrom: string;
  profileLocale: AppLocale;
  isPublic: boolean;
}

export type CandidateProfileErrorKey =
  | "nameTooShort"
  | "headlineRequired"
  | "headlineTooLong"
  | "categoriesRequired"
  | "aboutTooLong"
  | "salaryInvalid"
  | "skillsTooMany"
  | "dateInvalid"
  | "invalidValue";

export type CandidateProfileErrors = Partial<
  Record<keyof CandidateProfileValues, CandidateProfileErrorKey>
>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function includesAll<T extends string>(allowed: readonly T[], values: readonly string[]): boolean {
  return values.every((value) => (allowed as readonly string[]).includes(value));
}

function includesOne<T extends string>(allowed: readonly T[], value: string): boolean {
  return (allowed as readonly string[]).includes(value);
}

export function parseSkills(skills: string): string[] {
  const unique = new Set(
    skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
  );
  return Array.from(unique);
}

// Server action приймає будь-який JSON, а не лише те, що зібрала форма —
// перевіряємо типи до validateCandidateProfile, щоб підроблений запит не
// падав з TypeError (напр. `categories: "it"` замість масиву).
export function isCandidateProfileShape(value: unknown): value is CandidateProfileValues {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const strings = [
    "name",
    "headline",
    "locationCode",
    "experienceLevel",
    "skills",
    "about",
    "salaryExpectationFrom",
    "currency",
    "availableFrom",
    "profileLocale",
  ];
  const stringArrays = ["categories", "desiredEmploymentTypes", "desiredWorkFormats"];

  return (
    strings.every((key) => typeof v[key] === "string") &&
    stringArrays.every(
      (key) => Array.isArray(v[key]) && (v[key] as unknown[]).every((i) => typeof i === "string"),
    ) &&
    Array.isArray(v.languages) &&
    v.languages.every(
      (l) =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as Record<string, unknown>).code === "string" &&
        typeof (l as Record<string, unknown>).level === "string",
    ) &&
    typeof v.isPublic === "boolean"
  );
}

// Ті самі перевірки працюють і на клієнті (миттєві підказки), і в server
// action — туди значення приходять від будь-кого, тож enum-и перевіряються
// теж, а не лише "людські" правила.
export function validateCandidateProfile(values: CandidateProfileValues): CandidateProfileErrors {
  const errors: CandidateProfileErrors = {};

  if (values.name.trim().length < 2) errors.name = "nameTooShort";

  const headline = values.headline.trim();
  if (headline.length === 0) errors.headline = "headlineRequired";
  else if (headline.length > HEADLINE_MAX_LENGTH) errors.headline = "headlineTooLong";

  if (values.categories.length === 0) errors.categories = "categoriesRequired";
  else if (!includesAll(CATEGORY_IDS, values.categories)) errors.categories = "invalidValue";

  if (!includesOne(LOCATION_CODES, values.locationCode)) errors.locationCode = "invalidValue";
  if (!includesAll(EMPLOYMENT_TYPE_IDS, values.desiredEmploymentTypes)) {
    errors.desiredEmploymentTypes = "invalidValue";
  }
  if (!includesAll(WORK_FORMAT_IDS, values.desiredWorkFormats)) {
    errors.desiredWorkFormats = "invalidValue";
  }
  if (!includesOne(EXPERIENCE_LEVEL_IDS, values.experienceLevel)) {
    errors.experienceLevel = "invalidValue";
  }
  if (!includesOne(routing.locales, values.profileLocale)) errors.profileLocale = "invalidValue";
  if (!includesOne(CURRENCIES, values.currency)) errors.currency = "invalidValue";

  const languagesValid = values.languages.every(
    (language) =>
      includesOne(LANGUAGE_CODES, language.code) && includesOne(LANGUAGE_LEVELS, language.level),
  );
  const languageCodes = values.languages.map((language) => language.code);
  if (!languagesValid || new Set(languageCodes).size !== languageCodes.length) {
    errors.languages = "invalidValue";
  }

  if (parseSkills(values.skills).length > SKILLS_MAX_COUNT) errors.skills = "skillsTooMany";
  if (values.about.length > ABOUT_MAX_LENGTH) errors.about = "aboutTooLong";

  const salary = values.salaryExpectationFrom.trim();
  if (salary !== "" && !/^\d{1,7}$/.test(salary)) errors.salaryExpectationFrom = "salaryInvalid";

  const date = values.availableFrom.trim();
  if (date !== "" && (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date)))) {
    errors.availableFrom = "dateInvalid";
  }

  return errors;
}

// Рядок для insert/update у job_platform_candidates (без slug/user_id — їх
// додає server action).
export function normalizeCandidateProfile(values: CandidateProfileValues) {
  const salary = values.salaryExpectationFrom.trim();
  const date = values.availableFrom.trim();
  const about = values.about.trim();

  return {
    name: values.name.trim(),
    headline: values.headline.trim(),
    categories: values.categories,
    location_code: values.locationCode,
    desired_employment_types: values.desiredEmploymentTypes,
    desired_work_formats: values.desiredWorkFormats,
    experience_level: values.experienceLevel,
    languages: values.languages,
    skills: parseSkills(values.skills),
    about: about === "" ? null : about,
    salary_expectation_from: salary === "" ? null : Number(salary),
    // Валюта має сенс лише разом із сумою.
    currency: salary === "" ? null : values.currency,
    available_from: date === "" ? null : date,
    profile_locale: values.profileLocale,
    is_public: values.isPublic,
    updated_at: new Date().toISOString(),
  };
}

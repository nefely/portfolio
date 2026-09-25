import { CATEGORY_IDS } from "@/data/categories";
import { EMPLOYMENT_TYPE_IDS } from "@/data/employmentTypes";
import { EXPERIENCE_LEVEL_IDS } from "@/data/experienceLevels";
import { LANGUAGE_CODES } from "@/data/languages";
import { LOCATION_CODES } from "@/data/locations";
import { WORK_FORMAT_IDS } from "@/data/workFormats";
import type { CategoryId } from "@/types/category";
import type { Currency, EmploymentType, ExperienceLevel, WorkFormat } from "@/types/job";
import type { LanguageCode } from "@/types/language";
import type { LocationCode } from "@/types/location";
import { CURRENCIES } from "./candidateProfile";

export const JOB_TITLE_MIN_LENGTH = 3;
export const JOB_TITLE_MAX_LENGTH = 120;
export const JOB_DESCRIPTION_MIN_LENGTH = 20;
export const JOB_DESCRIPTION_MAX_LENGTH = 3000;

// Стан форми вакансії в кабінеті роботодавця (зарплати — рядками, як в інпутах).
export interface JobPostingValues {
  title: string;
  description: string;
  category: CategoryId;
  locationCode: LocationCode;
  employmentType: EmploymentType;
  workFormat: WorkFormat;
  experienceLevel: ExperienceLevel;
  requiredLanguages: LanguageCode[];
  salaryFrom: string;
  salaryTo: string;
  currency: Currency;
}

export type JobPostingErrorKey =
  | "titleTooShort"
  | "titleTooLong"
  | "descriptionTooShort"
  | "descriptionTooLong"
  | "salaryInvalid"
  | "salaryRange"
  | "invalidValue";

export type JobPostingErrors = Partial<Record<keyof JobPostingValues, JobPostingErrorKey>>;

const SALARY_PATTERN = /^\d{1,7}$/;

function includesOne(allowed: readonly string[], value: string): boolean {
  return allowed.includes(value);
}

// Див. isCandidateProfileShape — server action приймає будь-який JSON.
export function isJobPostingShape(value: unknown): value is JobPostingValues {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const strings = [
    "title",
    "description",
    "category",
    "locationCode",
    "employmentType",
    "workFormat",
    "experienceLevel",
    "salaryFrom",
    "salaryTo",
    "currency",
  ];
  return (
    strings.every((key) => typeof v[key] === "string") &&
    Array.isArray(v.requiredLanguages) &&
    v.requiredLanguages.every((code) => typeof code === "string")
  );
}

export function validateJobPosting(values: JobPostingValues): JobPostingErrors {
  const errors: JobPostingErrors = {};

  const title = values.title.trim();
  if (title.length < JOB_TITLE_MIN_LENGTH) errors.title = "titleTooShort";
  else if (title.length > JOB_TITLE_MAX_LENGTH) errors.title = "titleTooLong";

  const description = values.description.trim();
  if (description.length < JOB_DESCRIPTION_MIN_LENGTH) errors.description = "descriptionTooShort";
  else if (description.length > JOB_DESCRIPTION_MAX_LENGTH) {
    errors.description = "descriptionTooLong";
  }

  if (!includesOne(CATEGORY_IDS, values.category)) errors.category = "invalidValue";
  if (!includesOne(LOCATION_CODES, values.locationCode)) errors.locationCode = "invalidValue";
  if (!includesOne(EMPLOYMENT_TYPE_IDS, values.employmentType)) {
    errors.employmentType = "invalidValue";
  }
  if (!includesOne(WORK_FORMAT_IDS, values.workFormat)) errors.workFormat = "invalidValue";
  if (!includesOne(EXPERIENCE_LEVEL_IDS, values.experienceLevel)) {
    errors.experienceLevel = "invalidValue";
  }
  if (!includesOne(CURRENCIES, values.currency)) errors.currency = "invalidValue";

  const languages = values.requiredLanguages;
  if (
    !languages.every((code) => includesOne(LANGUAGE_CODES, code)) ||
    new Set(languages).size !== languages.length
  ) {
    errors.requiredLanguages = "invalidValue";
  }

  const from = values.salaryFrom.trim();
  const to = values.salaryTo.trim();
  if (from !== "" && !SALARY_PATTERN.test(from)) errors.salaryFrom = "salaryInvalid";
  if (to !== "" && !SALARY_PATTERN.test(to)) errors.salaryTo = "salaryInvalid";
  if (
    !errors.salaryFrom &&
    !errors.salaryTo &&
    from !== "" &&
    to !== "" &&
    Number(from) > Number(to)
  ) {
    errors.salaryTo = "salaryRange";
  }

  return errors;
}

// Рядок для insert/update у job_platform_jobs (без employer_id — його додає
// server action з профілю поточного користувача). title/description у БД —
// jsonb { uk, en, pl } (переклади seed-вакансій); роботодавець пише одною
// мовою, тож той самий текст іде в усі три ключі — pickLocalized і пошук
// filterJobs працюють без змін.
export function normalizeJobPosting(values: JobPostingValues) {
  const title = values.title.trim();
  const description = values.description.trim();
  const from = values.salaryFrom.trim();
  const to = values.salaryTo.trim();
  const hasSalary = from !== "" || to !== "";

  return {
    title: { uk: title, en: title, pl: title },
    description: { uk: description, en: description, pl: description },
    category: values.category,
    location_code: values.locationCode,
    employment_type: values.employmentType,
    work_format: values.workFormat,
    experience_level: values.experienceLevel,
    required_languages: values.requiredLanguages,
    salary_from: from === "" ? null : Number(from),
    salary_to: to === "" ? null : Number(to),
    // Валюта має сенс лише разом із сумою.
    currency: hasSalary ? values.currency : null,
  };
}

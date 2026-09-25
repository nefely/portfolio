import "server-only";

import { isUuid } from "@/lib/isUuid";
import { createClient } from "@/lib/supabase/server";
import type { CandidateProfileValues } from "@/lib/validation/candidateProfile";
import type { EmployerProfileValues } from "@/lib/validation/employerProfile";
import type { CategoryId } from "@/types/category";
import type { CandidateLanguage } from "@/types/candidate";
import type { Currency, EmploymentType, ExperienceLevel, WorkFormat } from "@/types/job";
import type { AppLocale, LocalizedText } from "@/types/i18n";
import type { JobPostingValues } from "@/lib/validation/jobPosting";
import type { LanguageCode } from "@/types/language";
import type { LocationCode } from "@/types/location";

export interface OwnCandidateProfile {
  slug: string;
  values: CandidateProfileValues;
}

export interface OwnEmployerProfile {
  id: string;
  slug: string;
  values: EmployerProfileValues;
}

export interface OwnJobSummary {
  id: string;
  title: LocalizedText;
  category: CategoryId;
  locationCode: LocationCode;
  postedAt: string;
}

// Профіль поточного користувача у вигляді значень форми кабінету. RLS і так
// обмежує update чужих рядків, але фільтр по user_id тут — щоб не отримати
// випадково чужий (публічний) профіль.
export async function getOwnCandidateProfile(userId: string): Promise<OwnCandidateProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_candidates")
    .select(
      "slug, name, headline, categories, location_code, desired_employment_types, desired_work_formats, experience_level, languages, skills, about, salary_expectation_from, currency, available_from, profile_locale, is_public",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    slug: data.slug,
    values: {
      name: data.name,
      headline: data.headline,
      categories: data.categories as CategoryId[],
      locationCode: data.location_code as LocationCode,
      desiredEmploymentTypes: data.desired_employment_types as EmploymentType[],
      desiredWorkFormats: data.desired_work_formats as WorkFormat[],
      experienceLevel: data.experience_level as ExperienceLevel,
      languages: data.languages as CandidateLanguage[],
      skills: (data.skills as string[]).join(", "),
      about: data.about ?? "",
      salaryExpectationFrom:
        data.salary_expectation_from === null ? "" : String(data.salary_expectation_from),
      currency: (data.currency as Currency | null) ?? "EUR",
      availableFrom: data.available_from ?? "",
      profileLocale: data.profile_locale as AppLocale,
      isPublic: data.is_public,
    },
  };
}

export async function getOwnEmployerProfile(userId: string): Promise<OwnEmployerProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_employers")
    .select("id, slug, name, location_code, website, about")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    values: {
      name: data.name,
      locationCode: data.location_code as LocationCode,
      website: data.website ?? "",
      about: data.about ?? "",
    },
  };
}

// Вакансії компанії поточного роботодавця — для списку в кабінеті.
export async function getOwnJobs(employerId: string): Promise<OwnJobSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_jobs")
    .select("id, title, category, location_code, posted_at")
    .eq("employer_id", employerId)
    .order("posted_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((row) => ({
    id: row.id,
    title: row.title as LocalizedText,
    category: row.category as CategoryId,
    locationCode: row.location_code as LocationCode,
    postedAt: row.posted_at,
  }));
}

// Одна вакансія для форми редагування. Фільтр по employer_id — чужу вакансію
// (навіть публічну) редагувати не можна, для неї повертається null → 404.
export async function getOwnJob(
  jobId: string,
  employerId: string,
  locale: AppLocale,
): Promise<JobPostingValues | null> {
  if (!isUuid(jobId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_jobs")
    .select(
      "title, description, category, location_code, employment_type, work_format, experience_level, required_languages, salary_from, salary_to, currency",
    )
    .eq("id", jobId)
    .eq("employer_id", employerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const title = data.title as LocalizedText;
  const description = data.description as LocalizedText;

  return {
    title: title[locale],
    description: description[locale],
    category: data.category as CategoryId,
    locationCode: data.location_code as LocationCode,
    employmentType: data.employment_type as EmploymentType,
    workFormat: data.work_format as WorkFormat,
    experienceLevel: data.experience_level as ExperienceLevel,
    requiredLanguages: data.required_languages as LanguageCode[],
    salaryFrom: data.salary_from === null ? "" : String(data.salary_from),
    salaryTo: data.salary_to === null ? "" : String(data.salary_to),
    currency: (data.currency as Currency | null) ?? "EUR",
  };
}

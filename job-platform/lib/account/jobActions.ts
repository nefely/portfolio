"use server";

import { requireProfile } from "@/lib/auth/dal";
import { isUuid } from "@/lib/isUuid";
import { createClient } from "@/lib/supabase/server";
import {
  isJobPostingShape,
  normalizeJobPosting,
  validateJobPosting,
  type JobPostingErrors,
  type JobPostingValues,
} from "@/lib/validation/jobPosting";
import type { AccountFormError } from "@/types/account";

export type JobActionResult =
  { ok: true; id: string } | { ok: false; errors?: JobPostingErrors; formError?: AccountFormError };

// Спільна перевірка для всіх дій з вакансіями: залогінений роботодавець із
// уже збереженим профілем компанії — вакансія публікується від її імені.
// RLS у Supabase повторює ці умови на рівні БД (див. schema.sql).
async function requireOwnEmployer() {
  const { user, role } = await requireProfile("/account");
  if (role !== "employer") return { error: "forbidden" as const };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_employers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { error: "saveFailed" as const };
  if (!data) return { error: "companyRequired" as const };
  return { supabase, employerId: data.id as string };
}

function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean);
}

export async function createJob(values: JobPostingValues): Promise<JobActionResult> {
  const owner = await requireOwnEmployer();
  if ("error" in owner) return { ok: false, formError: owner.error };
  if (!isJobPostingShape(values)) return { ok: false, formError: "saveFailed" };

  const errors = validateJobPosting(values);
  if (hasErrors(errors)) return { ok: false, errors };

  const { data, error } = await owner.supabase
    .from("job_platform_jobs")
    .insert({ ...normalizeJobPosting(values), employer_id: owner.employerId })
    .select("id")
    .single();

  return error ? { ok: false, formError: "saveFailed" } : { ok: true, id: data.id };
}

export async function updateJob(id: string, values: JobPostingValues): Promise<JobActionResult> {
  const owner = await requireOwnEmployer();
  if ("error" in owner) return { ok: false, formError: owner.error };
  if (typeof id !== "string" || !isUuid(id) || !isJobPostingShape(values)) {
    return { ok: false, formError: "saveFailed" };
  }

  const errors = validateJobPosting(values);
  if (hasErrors(errors)) return { ok: false, errors };

  // .select() після update повертає змінені рядки: порожньо = вакансії немає
  // або вона не цієї компанії (RLS/фільтр відсікли) — не мовчимо про "успіх".
  const { data, error } = await owner.supabase
    .from("job_platform_jobs")
    .update(normalizeJobPosting(values))
    .eq("id", id)
    .eq("employer_id", owner.employerId)
    .select("id");

  if (error || data.length === 0) return { ok: false, formError: "saveFailed" };
  return { ok: true, id };
}

export async function deleteJob(id: string): Promise<{ ok: boolean }> {
  const owner = await requireOwnEmployer();
  if ("error" in owner || typeof id !== "string" || !isUuid(id)) return { ok: false };

  const { data, error } = await owner.supabase
    .from("job_platform_jobs")
    .delete()
    .eq("id", id)
    .eq("employer_id", owner.employerId)
    .select("id");

  return { ok: !error && data.length > 0 };
}

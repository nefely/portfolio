"use server";

import { requireProfile } from "@/lib/auth/dal";
import { uniqueSlug } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/server";
import {
  isCandidateProfileShape,
  normalizeCandidateProfile,
  validateCandidateProfile,
  type CandidateProfileErrors,
  type CandidateProfileValues,
} from "@/lib/validation/candidateProfile";
import {
  isEmployerProfileShape,
  normalizeEmployerProfile,
  validateEmployerProfile,
  type EmployerProfileErrors,
  type EmployerProfileValues,
} from "@/lib/validation/employerProfile";
import type { AccountFormError } from "@/types/account";

export type SaveProfileResult<TErrors> =
  { ok: true; slug: string } | { ok: false; errors?: TErrors; formError?: AccountFormError };

function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean);
}

// Server actions — публічні ендпоінти: роль і валідацію перевіряємо тут
// заново, незалежно від того, що вже перевірила форма на клієнті. RLS у
// Supabase — третій рубіж (insert/update лише свого рядка і лише з роллю).
export async function saveCandidateProfile(
  values: CandidateProfileValues,
): Promise<SaveProfileResult<CandidateProfileErrors>> {
  const { user, role } = await requireProfile("/account");
  if (role !== "seeker") return { ok: false, formError: "forbidden" };
  if (!isCandidateProfileShape(values)) return { ok: false, formError: "saveFailed" };

  const errors = validateCandidateProfile(values);
  if (hasErrors(errors)) return { ok: false, errors };

  const supabase = await createClient();
  const row = normalizeCandidateProfile(values);

  const { data: existing, error: selectError } = await supabase
    .from("job_platform_candidates")
    .select("slug")
    .eq("user_id", user.id)
    .maybeSingle();
  if (selectError) return { ok: false, formError: "saveFailed" };

  if (existing) {
    const { error } = await supabase
      .from("job_platform_candidates")
      .update(row)
      .eq("user_id", user.id);
    return error ? { ok: false, formError: "saveFailed" } : { ok: true, slug: existing.slug };
  }

  // Slug генерується один раз і більше не змінюється — посилання на профіль,
  // яке кандидат уже комусь надіслав, не ламається після зміни імені.
  const slug = uniqueSlug(row.name, "candidate");
  const { error } = await supabase
    .from("job_platform_candidates")
    .insert({ ...row, slug, user_id: user.id });
  return error ? { ok: false, formError: "saveFailed" } : { ok: true, slug };
}

export async function saveEmployerProfile(
  values: EmployerProfileValues,
): Promise<SaveProfileResult<EmployerProfileErrors>> {
  const { user, role } = await requireProfile("/account");
  if (role !== "employer") return { ok: false, formError: "forbidden" };
  if (!isEmployerProfileShape(values)) return { ok: false, formError: "saveFailed" };

  const errors = validateEmployerProfile(values);
  if (hasErrors(errors)) return { ok: false, errors };

  const supabase = await createClient();
  const row = normalizeEmployerProfile(values);

  const { data: existing, error: selectError } = await supabase
    .from("job_platform_employers")
    .select("slug")
    .eq("user_id", user.id)
    .maybeSingle();
  if (selectError) return { ok: false, formError: "saveFailed" };

  if (existing) {
    const { error } = await supabase
      .from("job_platform_employers")
      .update(row)
      .eq("user_id", user.id);
    return error ? { ok: false, formError: "saveFailed" } : { ok: true, slug: existing.slug };
  }

  const slug = uniqueSlug(row.name, "employer");
  const { error } = await supabase
    .from("job_platform_employers")
    .insert({ ...row, slug, user_id: user.id });
  return error ? { ok: false, formError: "saveFailed" } : { ok: true, slug };
}

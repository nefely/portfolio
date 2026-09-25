"use server";

import { redirect as nextRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  mapSupabaseAuthError,
  validateAuthForm,
  validateEmail,
  type AuthErrorKey,
  type AuthFormErrors,
} from "@/lib/validation/auth";
import { requireUser } from "./dal";
import { ensureProfile } from "./ensureProfile";
import { GOOGLE_AUTH_ENABLED } from "./features";
import { isAccountRole } from "./roles";
import { safeNextPath } from "./safeNextPath";
import { getSiteUrl } from "./siteUrl";

export interface AuthFormState {
  errors?: AuthFormErrors;
  formError?: AuthErrorKey;
  // Реєстрація пройшла, але Supabase чекає підтвердження email.
  checkEmailFor?: string;
  // Повертаємо email назад у форму, щоб після помилки не набирати знову.
  email?: string;
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function callbackUrl(locale: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `${await getSiteUrl()}/${locale}/auth/callback${query ? `?${query}` : ""}`;
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const role = readField(formData, "role");

  if (!isAccountRole(role)) {
    return { formError: "roleRequired", email };
  }

  const errors = validateAuthForm({ email, password });
  if (errors.email || errors.password) {
    return { errors, email };
  }

  const locale = await getLocale();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: await callbackUrl(locale, { role }) },
  });

  if (error) {
    return { formError: mapSupabaseAuthError(error), email };
  }

  // "Confirm email" вимкнено в Supabase → сесія вже є, роль фіксуємо одразу.
  // Інакше роль прийде разом із посиланням з листа (?role= у callback).
  if (data.session && data.user) {
    await ensureProfile(supabase, data.user.id, role);
    redirect({ href: "/account", locale });
  }

  return { checkEmailFor: email };
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");

  // Довжину пароля при вході не перевіряємо: акаунти зі спільного
  // Supabase (task-manager) могли створюватися з мінімумом у 6 символів.
  const errors: AuthFormErrors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (password === "") errors.password = "passwordRequired";
  if (errors.email || errors.password) {
    return { errors, email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { formError: mapSupabaseAuthError(error), email };
  }

  const locale = await getLocale();
  nextRedirect(safeNextPath(readField(formData, "next"), `/${locale}/account`));
}

// Одна дія і для входу, і для реєстрації через Google: для нового акаунта
// роль приходить з форми реєстрації, для входу її немає — тоді callback
// (або /account) сам відправить на вибір ролі, якщо рядка ще нема.
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const locale = await getLocale();
  if (!GOOGLE_AUTH_ENABLED) {
    redirect({ href: { pathname: "/login", query: { error: "callbackFailed" } }, locale });
  }

  const role = readField(formData, "role");
  const next = readField(formData, "next");

  const params: Record<string, string> = {};
  if (isAccountRole(role)) params.role = role;
  if (next) params.next = safeNextPath(next, "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: await callbackUrl(locale, params) },
  });

  if (error || !data.url) {
    redirect({ href: { pathname: "/login", query: { error: "callbackFailed" } }, locale });
  }

  nextRedirect(data.url!);
}

export async function chooseRole(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const user = await requireUser("/account/role");
  const role = readField(formData, "role");

  if (!isAccountRole(role)) {
    return { formError: "roleRequired" };
  }

  const supabase = await createClient();
  await ensureProfile(supabase, user.id, role);

  const locale = await getLocale();
  redirect({ href: "/account", locale });
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const locale = await getLocale();
  redirect({ href: "/", locale });
}

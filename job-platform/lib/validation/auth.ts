const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export type AuthErrorKey =
  | "emailInvalid"
  | "passwordTooShort"
  | "invalidCredentials"
  | "emailTaken"
  | "emailNotConfirmed"
  | "rateLimited"
  | "roleRequired"
  | "passwordRequired"
  | "callbackFailed"
  | "unknown";

export interface AuthFormErrors {
  email?: AuthErrorKey;
  password?: AuthErrorKey;
}

export function validateEmail(email: string): AuthErrorKey | undefined {
  return EMAIL_PATTERN.test(email.trim()) ? undefined : "emailInvalid";
}

export function validatePassword(password: string): AuthErrorKey | undefined {
  return password.length < MIN_PASSWORD_LENGTH ? "passwordTooShort" : undefined;
}

export function validateAuthForm(values: { email: string; password: string }): AuthFormErrors {
  const errors: AuthFormErrors = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

// Supabase повертає англомовні повідомлення (і `code` не завжди) — мапимо
// на ключі перекладу, а клієнт показує їх через useTranslations("auth.errors"),
// так само як ContactForm з ContactFormErrorKey.
export function mapSupabaseAuthError(error: { message?: string; code?: string }): AuthErrorKey {
  const code = error.code ?? "";
  const message = error.message ?? "";

  if (code === "invalid_credentials" || message.includes("Invalid login credentials")) {
    return "invalidCredentials";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "emailTaken";
  }
  if (code === "email_not_confirmed" || message.includes("Email not confirmed")) {
    return "emailNotConfirmed";
  }
  if (code === "weak_password" || message.includes("Password should be at least")) {
    return "passwordTooShort";
  }
  if (code.startsWith("over_") || message.toLowerCase().includes("rate limit")) {
    return "rateLimited";
  }
  if (code === "email_address_invalid" || message.includes("Unable to validate email")) {
    return "emailInvalid";
  }
  return "unknown";
}

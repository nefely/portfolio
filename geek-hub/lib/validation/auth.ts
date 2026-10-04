const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export interface AuthFormErrors {
  email?: string;
  password?: string;
}

export function validateEmail(email: string): string | undefined {
  return EMAIL_PATTERN.test(email.trim()) ? undefined : "Enter a valid email address.";
}

export function validatePassword(password: string): string | undefined {
  return password.length < MIN_PASSWORD_LENGTH
    ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    : undefined;
}

export function validateAuthForm(
  values: { email: string; password: string },
  mode: "login" | "signup",
): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  // Довжину пароля при вході не перевіряємо: акаунти спільного Supabase
  // (task-manager) могли створюватися з мінімумом у 6 символів.
  if (mode === "signup") {
    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;
  } else if (values.password === "") {
    errors.password = "Enter your password.";
  }
  return errors;
}

// Supabase повертає технічні англомовні повідомлення (і `code` не завжди) —
// перекладаємо в зрозумілі людині.
export function describeAuthError(error: { message?: string; code?: string }): string {
  const code = error.code ?? "";
  const message = error.message ?? "";

  if (code === "invalid_credentials" || message.includes("Invalid login credentials")) {
    return "Wrong email or password.";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (code === "email_not_confirmed" || message.includes("Email not confirmed")) {
    return "Confirm your email first — check your inbox for the link.";
  }
  if (code === "weak_password" || message.includes("Password should be at least")) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (code.startsWith("over_") || message.toLowerCase().includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return "Something went wrong. Please try again.";
}

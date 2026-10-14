// Валідація форм на клієнті повторює check-обмеження БД (supabase/schema.sql),
// щоб користувач бачив помилку біля поля, а не загальний toast від Postgres.

export type Errors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateDeal(input: { title: string | null; value: string | null }) {
  const errors: Errors<"title" | "value"> = {};
  if (!input.title) errors.title = "Give the deal a name.";
  else if (input.title.length > 160) errors.title = "Keep it under 160 characters.";

  if (input.value !== null) {
    const amount = Number(input.value);
    if (!Number.isFinite(amount) || amount < 0) errors.value = "Enter a positive amount.";
    else if (amount >= 1e12) errors.value = "That amount is too large.";
  }
  return errors;
}

export function validateCompany(input: { name: string | null; domain: string | null }) {
  const errors: Errors<"name" | "domain"> = {};
  if (!input.name) errors.name = "Company name is required.";
  else if (input.name.length > 120) errors.name = "Keep it under 120 characters.";
  if (input.domain && /\s/.test(input.domain)) errors.domain = "A domain can't contain spaces.";
  return errors;
}

export function validateContact(input: { first_name: string | null; email: string | null }) {
  const errors: Errors<"first_name" | "email"> = {};
  if (!input.first_name) errors.first_name = "First name is required.";
  if (input.email && !EMAIL_RE.test(input.email)) errors.email = "That doesn't look like an email.";
  return errors;
}

export function validateActivity(input: { subject: string | null }) {
  const errors: Errors<"subject"> = {};
  if (!input.subject) errors.subject = "What needs to happen?";
  else if (input.subject.length > 200) errors.subject = "Keep it under 200 characters.";
  return errors;
}

export function hasErrors(errors: object) {
  return Object.keys(errors).length > 0;
}

/** "example.com", "https://www.example.com/path" → "example.com". */
export function normalizeDomain(value: string | null) {
  if (!value) return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

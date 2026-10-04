import { USERNAME_PATTERN } from "@/lib/auth/username";

// Ті самі обмеження, що й check-и в supabase/schema.sql — щоб юзер бачив
// зрозуміле повідомлення до запиту, а не помилку Postgres після.

export const REVIEW_MIN = 20;
export const REVIEW_MAX = 5000;
export const LIST_TITLE_MAX = 80;
export const LIST_DESCRIPTION_MAX = 500;
export const BIO_MAX = 300;
export const DISPLAY_NAME_MAX = 50;

export function validateReview(values: { score: number | null; body: string }) {
  const errors: { score?: string; body?: string } = {};
  if (!values.score || values.score < 1 || values.score > 10)
    errors.score = "Pick a score from 1 to 10.";
  const length = values.body.trim().length;
  if (length < REVIEW_MIN) errors.body = `Write at least ${REVIEW_MIN} characters.`;
  else if (length > REVIEW_MAX) errors.body = `Keep it under ${REVIEW_MAX} characters.`;
  return errors;
}

export function validateList(values: { title: string; description: string }) {
  const errors: { title?: string; description?: string } = {};
  const title = values.title.trim();
  if (!title) errors.title = "Give your list a name.";
  else if (title.length > LIST_TITLE_MAX)
    errors.title = `Keep the name under ${LIST_TITLE_MAX} characters.`;
  if (values.description.trim().length > LIST_DESCRIPTION_MAX) {
    errors.description = `Keep the description under ${LIST_DESCRIPTION_MAX} characters.`;
  }
  return errors;
}

export function validateProfile(values: { username: string; displayName: string; bio: string }) {
  const errors: { username?: string; displayName?: string; bio?: string } = {};
  if (!USERNAME_PATTERN.test(values.username)) {
    errors.username = "3–24 characters: lowercase letters, numbers and underscores.";
  }
  if (values.displayName.trim().length > DISPLAY_NAME_MAX) {
    errors.displayName = `Keep it under ${DISPLAY_NAME_MAX} characters.`;
  }
  if (values.bio.trim().length > BIO_MAX) errors.bio = `Keep it under ${BIO_MAX} characters.`;
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;

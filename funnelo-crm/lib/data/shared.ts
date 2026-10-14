import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export type Db = SupabaseClient;

export const PAGE_SIZE = 25;

/** Supabase повертає { data, error } — у queryFn/mutationFn нам потрібен throw. */
export function unwrap<T>({ data, error }: { data: T | null; error: PostgrestError | null }): T {
  if (error) throw new Error(describeDbError(error));
  return data as T;
}

/** Повідомлення PostgREST/Postgres → зрозумілий користувачу текст. */
export function describeDbError(error: Pick<PostgrestError, "code" | "message">) {
  switch (error.code) {
    // RLS-відмова на insert/update (with check) — тобто чужий запис.
    case "42501":
      return error.message.includes("row-level security")
        ? "You can only change records you own."
        : error.message;
    case "23503":
      return "This record is still referenced elsewhere.";
    case "23514":
      return "Some values are out of the allowed range.";
    case "PGRST116":
      return "Record not found or you no longer have access to it.";
    default:
      return error.message;
  }
}

/**
 * Рядок пошуку → патерн для ilike усередині PostgREST `or=(...)`. Кома, дужки
 * й лапки там — синтаксис фільтра, а % і _ — wildcard-и, тож їх прибираємо.
 */
export function ilikePattern(search: string) {
  const cleaned = search
    .replace(/[,()"'\\%_*]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  return cleaned ? `%${cleaned}%` : null;
}

export function pageRange(page: number) {
  const from = page * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 };
}

export type Page<T> = { rows: T[]; total: number };

/** Порожні рядки з форм → null, щоб у БД не осідали "" замість відсутнього значення. */
export function nullIfEmpty<T extends Record<string, unknown>>(values: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    result[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return result as T;
}

/** Експорт у CSV бере до 2000 рядків поточного фільтра одним запитом. */
export const EXPORT_RANGE = { from: 0, to: 1999 };

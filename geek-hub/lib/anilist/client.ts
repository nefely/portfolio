import "server-only";

import { unstable_cache } from "next/cache";
import { ApiError, parseRetryAfter, withRetry } from "@/lib/api/retry";

const ANILIST_URL = "https://graphql.anilist.co";
const REQUEST_TIMEOUT_MS = 10_000;

// Скільки секунд тримати результат у Data Cache Next.js. Каталог змінюється
// повільно, тож навіть "короткий" TTL — 10 хвилин: кожен унікальний запит
// іде в AniList не частіше за раз на TTL, а не на кожного відвідувача.
export const REVALIDATE = {
  short: 60 * 10, // пошук, тренди, онгоінги
  medium: 60 * 60 * 6, // топи, сторінка тайтлу
  long: 60 * 60 * 24 * 7, // жанри й теги
} as const;

interface GraphQLResponse<T> {
  data: T | null;
  errors?: { message: string; status?: number }[];
}

interface QueryOptions<T> {
  revalidate: number;
  tags?: string[];
  // Додаткова перевірка "відповідь осмислена" (напр. полиці не порожні).
  // Невалідна відповідь = збій: повтор і НЕ потрапляє в кеш.
  validate?: (data: T) => boolean;
}

async function requestAniList<T>(
  query: string,
  variables: Record<string, unknown>,
  validate: ((data: T) => boolean) | undefined,
): Promise<T> {
  return withRetry(
    async () => {
      let response: Response;
      try {
        response = await fetch(ANILIST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query, variables }),
          // Сирий fetch не кешуємо: Data Cache зберігав би будь-яку відповідь
          // 200, у т.ч. часткову (AniList під навантаженням віддає 200 з
          // errors або порожніми списками). Кешуємо вже перевірений результат
          // — див. unstable_cache в anilistQuery.
          cache: "no-store",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (error) {
        // Мережа / таймаут — статус 0, щоб withRetry теж спробував ще раз.
        throw new ApiError(`AniList request failed: ${(error as Error).message}`, 0);
      }

      const body = (await response.json().catch(() => null)) as GraphQLResponse<T> | null;

      // Часткова відповідь (data + errors) — теж збій, а не "майже успіх".
      if (!response.ok || !body?.data || body.errors?.length) {
        const status = response.ok ? (body?.errors?.[0]?.status ?? 503) : response.status;
        throw new ApiError(
          body?.errors?.[0]?.message ?? `AniList ${response.status}`,
          status,
          parseRetryAfter(response.headers.get("retry-after")),
        );
      }

      if (validate && !validate(body.data)) {
        // 503 — щоб withRetry спробував ще раз.
        throw new ApiError("AniList returned an incomplete response", 503);
      }

      return body.data;
    },
    { retries: 2, baseDelayMs: 700 },
  );
}

// unstable_cache кешує лише успішно повернутий результат: якщо запит упав або
// не пройшов перевірку, в кеш нічого не пишеться і наступний відвідувач
// отримає свіжу спробу, а не "залиплу" порожню полицю на 10 хвилин.
// Ключ — текст запиту + змінні, тож однакові запити діляться одним записом.
export async function anilistQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  { revalidate, tags, validate }: QueryOptions<T>,
): Promise<T> {
  const cached = unstable_cache(
    () => requestAniList<T>(query, variables, validate),
    ["anilist", query, JSON.stringify(variables)],
    { revalidate, tags },
  );
  return cached();
}

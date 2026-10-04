import "server-only";

import { ApiError, parseRetryAfter, withRetry } from "@/lib/api/retry";

const ANILIST_URL = "https://graphql.anilist.co";
const REQUEST_TIMEOUT_MS = 10_000;

// Скільки секунд тримати відповідь у Data Cache Next.js. Каталог змінюється
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

export async function anilistQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  { revalidate, tags }: { revalidate: number; tags?: string[] },
): Promise<T> {
  return withRetry(
    async () => {
      let response: Response;
      try {
        response = await fetch(ANILIST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query, variables }),
          // POST Next.js кешує лише явно: force-cache + revalidate. Тіло
          // запиту (query + variables) входить у ключ кешу. Зберігаються
          // тільки відповіді 200, тож помилки не "залипають" у кеші.
          cache: "force-cache",
          next: { revalidate, tags },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (error) {
        // Мережа / таймаут — статус 0, щоб withRetry теж спробував ще раз.
        throw new ApiError(`AniList request failed: ${(error as Error).message}`, 0);
      }

      const body = (await response.json().catch(() => null)) as GraphQLResponse<T> | null;

      if (!response.ok || !body?.data) {
        const status = response.ok ? (body?.errors?.[0]?.status ?? 500) : response.status;
        throw new ApiError(
          body?.errors?.[0]?.message ?? `AniList ${response.status}`,
          status,
          parseRetryAfter(response.headers.get("retry-after")),
        );
      }

      return body.data;
    },
    { retries: 2, baseDelayMs: 700 },
  );
}

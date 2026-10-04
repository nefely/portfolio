import { infiniteQueryOptions } from "@tanstack/react-query";
import type { AnimePage } from "@/types/anime";
import { serializeFilters, type AnimeFilters } from "@/lib/anime/filters";
import { queryKeys } from "./keys";

async function fetchAnimePage(
  filtersKey: string,
  page: number,
  signal: AbortSignal,
): Promise<AnimePage> {
  const query = new URLSearchParams(filtersKey);
  query.set("page", String(page));
  // signal: TanStack скасовує запит, якщо фільтри змінились раніше, ніж
  // прийшла відповідь — в AniList не летить купа непотрібних запитів.
  const response = await fetch(`/api/anime?${query}`, { signal });
  if (!response.ok) throw new Error("Failed to load anime");
  return response.json();
}

export function animeSearchOptions(filters: AnimeFilters) {
  const filtersKey = serializeFilters(filters);
  return infiniteQueryOptions({
    queryKey: queryKeys.animeSearch(filtersKey),
    queryFn: ({ pageParam, signal }) => fetchAnimePage(filtersKey, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    // Каталог майже статичний: повернувшись до тих самих фільтрів протягом
    // 10 хвилин, отримуємо результати миттєво з кешу, без запиту.
    staleTime: 10 * 60 * 1000,
  });
}

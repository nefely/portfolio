import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Catalog } from "@/components/catalog/Catalog";
import { parseFilters } from "@/lib/anime/filters";
import { getGenres, searchAnime } from "@/lib/anilist/queries";
import { animeSearchOptions } from "@/lib/query/animeSearch";
import type { GenreGroups } from "@/types/anime";

export const metadata: Metadata = {
  title: "Browse anime",
  description: "Filter thousands of anime by genre, season, year, format and score.",
};

const NO_GENRES: GenreGroups = { genres: [], themes: [], settings: [], demographics: [] };

export default async function AnimeCatalogPage({ searchParams }: PageProps<"/anime">) {
  const filters = parseFilters(await searchParams);
  const queryClient = new QueryClient();

  // Перша сторінка результатів рендериться на сервері й гідратується в кеш
  // TanStack Query під тим самим ключем, що й на клієнті — після гідратації
  // клієнт не повторює запит. prefetch* ніколи не кидає: при збої AniList
  // клієнт просто спробує сам і покаже помилку з кнопкою "Retry".
  const [, genres] = await Promise.all([
    queryClient.prefetchInfiniteQuery({
      ...animeSearchOptions(filters),
      queryFn: ({ pageParam }) => searchAnime(filters, pageParam),
    }),
    getGenres().catch(() => NO_GENRES),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Catalog genres={genres} />
    </HydrationBoundary>
  );
}

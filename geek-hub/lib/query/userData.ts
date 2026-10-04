import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchEntries } from "@/lib/library/entries";
import { fetchList, fetchMyLists } from "@/lib/library/lists";
import { fetchMyReview, fetchReviews } from "@/lib/library/reviews";
import { fetchProfile } from "@/lib/library/profiles";
import { queryKeys } from "./keys";

// queryFn тут — браузерні. Серверні сторінки, що роблять prefetch, беруть
// той самий queryKey, але підміняють queryFn на виклик із серверним клієнтом.

export const entriesOptions = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.entries(userId),
    queryFn: () => fetchEntries(createClient(), userId),
    // Бібліотеку змінює лише сам користувач, і кожна мутація оновлює кеш —
    // фонові перезапити не потрібні.
    staleTime: 5 * 60 * 1000,
  });

export const listsOptions = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.lists(userId),
    queryFn: () => fetchMyLists(createClient(), userId),
    staleTime: 5 * 60 * 1000,
  });

export const listOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.list(id),
    queryFn: () => fetchList(createClient(), id),
    staleTime: 60 * 1000,
  });

export const profileOptions = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.profile(userId),
    queryFn: () => fetchProfile(createClient(), userId),
    staleTime: 10 * 60 * 1000,
  });

export const reviewsOptions = (animeId: number) =>
  infiniteQueryOptions({
    queryKey: queryKeys.reviews(animeId),
    queryFn: ({ pageParam }) => fetchReviews(createClient(), animeId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: 60 * 1000,
  });

export const myReviewOptions = (userId: string, animeId: number) =>
  queryOptions({
    queryKey: queryKeys.myReview(userId, animeId),
    queryFn: () => fetchMyReview(createClient(), userId, animeId),
    staleTime: 5 * 60 * 1000,
  });

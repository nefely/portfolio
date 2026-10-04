"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReviewInput } from "@/types/library";
import { createClient } from "@/lib/supabase/client";
import { deleteReview, upsertReview } from "@/lib/library/reviews";
import { queryKeys } from "@/lib/query/keys";
import { myReviewOptions, reviewsOptions } from "@/lib/query/userData";
import { useSessionUser } from "./useSessionUser";

export function useReviews(animeId: number) {
  return useInfiniteQuery(reviewsOptions(animeId));
}

export function useMyReview(animeId: number) {
  const { user } = useSessionUser();
  return useQuery({ ...myReviewOptions(user?.id ?? "", animeId), enabled: Boolean(user) });
}

export function useSaveReview(animeId: number) {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    mutationFn: (input: ReviewInput) => {
      if (!user) throw new Error("Sign in to write a review");
      return upsertReview(createClient(), user.id, input);
    },
    onSuccess: (review) => {
      if (user) queryClient.setQueryData(queryKeys.myReview(user.id, animeId), review);
      // Позиція відгуку в стрічці (сортування, пагінація) залежить від сервера —
      // простіше перезапитати першу сторінку, ніж вклеювати вручну.
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews(animeId) });
      toast.success("Review saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteReview(animeId: number) {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(createClient(), reviewId),
    onSuccess: () => {
      if (user) queryClient.setQueryData(queryKeys.myReview(user.id, animeId), null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews(animeId) });
      toast.success("Review deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

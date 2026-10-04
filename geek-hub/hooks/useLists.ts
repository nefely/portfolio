"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AnimeCard } from "@/types/anime";
import type { AnimeList, AnimeListWithAuthor, ListInput } from "@/types/library";
import { createClient } from "@/lib/supabase/client";
import { addToList, createList, deleteList, removeFromList, updateList } from "@/lib/library/lists";
import { queryKeys } from "@/lib/query/keys";
import { listsOptions } from "@/lib/query/userData";
import { useSessionUser } from "./useSessionUser";

export function useMyLists() {
  const { user } = useSessionUser();
  return useQuery({ ...listsOptions(user?.id ?? ""), enabled: Boolean(user) });
}

// Список живе у двох кешах: "мої списки" і сторінка конкретного списку.
// Оптимістичні зміни застосовуємо до обох однією функцією.
function patchList(
  queryClient: QueryClient,
  userId: string,
  listId: string,
  patch: (list: AnimeList) => AnimeList,
) {
  queryClient.setQueryData<AnimeList[]>(queryKeys.lists(userId), (lists) =>
    lists?.map((list) => (list.id === listId ? patch(list) : list)),
  );
  queryClient.setQueryData<AnimeListWithAuthor | null>(queryKeys.list(listId), (list) =>
    list ? { ...list, ...patch(list) } : list,
  );
}

function snapshot(queryClient: QueryClient, userId: string, listId: string) {
  return {
    lists: queryClient.getQueryData<AnimeList[]>(queryKeys.lists(userId)),
    list: queryClient.getQueryData<AnimeListWithAuthor | null>(queryKeys.list(listId)),
  };
}

function restore(
  queryClient: QueryClient,
  userId: string,
  listId: string,
  saved: ReturnType<typeof snapshot>,
) {
  queryClient.setQueryData(queryKeys.lists(userId), saved.lists);
  queryClient.setQueryData(queryKeys.list(listId), saved.list);
}

function requireUserId(userId: string | undefined) {
  if (!userId) throw new Error("Sign in to manage lists");
  return userId;
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    mutationFn: (input: ListInput) => createList(createClient(), requireUserId(user?.id), input),
    onSuccess: (list) => {
      queryClient.setQueryData<AnimeList[]>(queryKeys.lists(list.userId), (lists = []) => [
        list,
        ...lists,
      ]);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateList(listId: string) {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    mutationFn: (input: ListInput) => updateList(createClient(), listId, input),
    onMutate: async (input) => {
      const userId = requireUserId(user?.id);
      const saved = snapshot(queryClient, userId, listId);
      patchList(queryClient, userId, listId, (list) => ({ ...list, ...input }));
      return { saved, userId };
    },
    onError: (error, _input, context) => {
      if (context) restore(queryClient, context.userId, listId, context.saved);
      toast.error(error.message);
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    mutationFn: (listId: string) => deleteList(createClient(), listId),
    onSuccess: (_result, listId) => {
      const userId = requireUserId(user?.id);
      queryClient.setQueryData<AnimeList[]>(queryKeys.lists(userId), (lists) =>
        lists?.filter((list) => list.id !== listId),
      );
      queryClient.removeQueries({ queryKey: queryKeys.list(listId) });
    },
    onError: (error) => toast.error(error.message),
  });
}

interface ToggleItemInput {
  listId: string;
  anime: AnimeCard;
  add: boolean;
}

export function useToggleListItem() {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    mutationFn: ({ listId, anime, add }: ToggleItemInput) =>
      add
        ? addToList(createClient(), listId, anime)
        : removeFromList(createClient(), listId, anime.id),
    onMutate: async ({ listId, anime, add }) => {
      const userId = requireUserId(user?.id);
      await queryClient.cancelQueries({ queryKey: queryKeys.lists(userId) });
      const saved = snapshot(queryClient, userId, listId);
      const now = new Date().toISOString();
      patchList(queryClient, userId, listId, (list) => ({
        ...list,
        updatedAt: now,
        items: add
          ? [
              { animeId: anime.id, anime, addedAt: now },
              ...list.items.filter((item) => item.animeId !== anime.id),
            ]
          : list.items.filter((item) => item.animeId !== anime.id),
      }));
      return { saved, userId };
    },
    onError: (error, { listId }, context) => {
      if (context) restore(queryClient, context.userId, listId, context.saved);
      toast.error(error.message);
    },
  });
}

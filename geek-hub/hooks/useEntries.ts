"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Entry, EntryInput } from "@/types/library";
import { createClient } from "@/lib/supabase/client";
import { deleteEntry, upsertEntry } from "@/lib/library/entries";
import { queryKeys } from "@/lib/query/keys";
import { entriesOptions } from "@/lib/query/userData";
import { useSessionUser } from "./useSessionUser";

export function useMyEntries() {
  const { user } = useSessionUser();
  return useQuery({ ...entriesOptions(user?.id ?? ""), enabled: Boolean(user) });
}

// Кожна картка підписується лише на СВІЙ запис через select. TanStack
// порівнює результат select структурно, тож коли змінюється статус одного
// тайтлу, перерендерюється одна картка, а не вся сітка з 24+ карток.
export function useEntry(animeId: number): Entry | null {
  const { user } = useSessionUser();
  const { data } = useQuery({
    ...entriesOptions(user?.id ?? ""),
    enabled: Boolean(user),
    select: (entries) => entries.find((entry) => entry.animeId === animeId) ?? null,
  });
  return data ?? null;
}

// Мутації бібліотеки виконуються строго по черзі: при швидких кліках "+1
// епізод" відповіді не можуть прийти в іншому порядку й перезаписати новіше
// значення старішим.
const ENTRY_MUTATION_SCOPE = { id: "library-entries" };

function optimisticEntry(input: EntryInput, existing: Entry | undefined): Entry {
  return {
    id: existing?.id ?? `optimistic-${input.animeId}`,
    ...input,
    updatedAt: new Date().toISOString(),
  };
}

export function useUpsertEntry() {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    scope: ENTRY_MUTATION_SCOPE,
    mutationFn: (input: EntryInput) => {
      if (!user) throw new Error("Sign in to track anime");
      return upsertEntry(createClient(), user.id, input);
    },
    // Оптимістично: UI оновлюється одразу, без очікування Supabase.
    onMutate: async (input) => {
      if (!user) return;
      const key = queryKeys.entries(user.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Entry[]>(key);
      const existing = previous?.find((entry) => entry.animeId === input.animeId);
      const next = optimisticEntry(input, existing);
      queryClient.setQueryData<Entry[]>(key, (entries = []) => [
        next,
        ...entries.filter((entry) => entry.animeId !== input.animeId),
      ]);
      return { previous };
    },
    onError: (error, _input, context) => {
      if (user && context) queryClient.setQueryData(queryKeys.entries(user.id), context.previous);
      toast.error(error.message);
    },
    // Підміняємо оптимістичний запис справжнім (id, updated_at із бази).
    onSuccess: (saved) => {
      if (!user) return;
      queryClient.setQueryData<Entry[]>(queryKeys.entries(user.id), (entries = []) =>
        entries.map((entry) => (entry.animeId === saved.animeId ? saved : entry)),
      );
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();

  return useMutation({
    scope: ENTRY_MUTATION_SCOPE,
    mutationFn: (animeId: number) => {
      if (!user) throw new Error("Sign in to track anime");
      return deleteEntry(createClient(), user.id, animeId);
    },
    onMutate: async (animeId) => {
      if (!user) return;
      const key = queryKeys.entries(user.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Entry[]>(key);
      queryClient.setQueryData<Entry[]>(key, (entries = []) =>
        entries.filter((entry) => entry.animeId !== animeId),
      );
      return { previous };
    },
    onError: (error, _animeId, context) => {
      if (user && context) queryClient.setQueryData(queryKeys.entries(user.id), context.previous);
      toast.error(error.message);
    },
  });
}

"use client";

import { useSearchParams } from "next/navigation";
import {
  DEFAULT_FILTERS,
  parseFilters,
  serializeFilters,
  type AnimeFilters,
} from "@/lib/anime/filters";

type HistoryMode = "push" | "replace";

// Фільтри живуть в URL — посиланням на результати можна поділитися, а
// "Назад" у браузері повертає попередні фільтри.
export function useAnimeFilters() {
  const searchParams = useSearchParams();
  // React Compiler мемоізує результат за searchParams, тож `filters` має
  // стабільну ідентичність, доки URL не змінився.
  const filters = parseFilters(searchParams);

  const setFilters = (patch: Partial<AnimeFilters>, mode: HistoryMode = "push") => {
    const query = serializeFilters({ ...filters, ...patch });
    const url = query ? `?${query}` : window.location.pathname;
    // Нативний History API замість router.push: Next.js синхронізує з ним
    // useSearchParams, але НЕ робить запит за новим RSC-payload — сервер не
    // перерендерює сторінку, а дані тягне (і кешує) TanStack Query.
    if (mode === "replace") window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  };

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS, q: filters.q });

  return { filters, setFilters, resetFilters };
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Без staleTime гідратовані з сервера дані одразу вважались би
        // застарілими й перезапитувались після гідратації.
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        // Перемикання вкладок не повинно смикати AniList/Supabase: свіжість
        // забезпечують staleTime та інвалідація після мутацій.
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// На сервері — новий клієнт на кожен рендер (ізоляція між запитами), у
// браузері — один на весь застосунок, щоб кеш жив між навігаціями.
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}

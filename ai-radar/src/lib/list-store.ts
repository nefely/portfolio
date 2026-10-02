"use client";

import { useSyncExternalStore } from "react";
import { MAX_COMPARE } from "./taxonomy";

// Generic localStorage-backed list of domains (used for the anonymous "compare"
// selection; favorites live in Supabase, see components/auth-provider.tsx).

const EMPTY: string[] = [];

export function createListStore(key: string, max = Infinity) {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();

  function read(): string[] {
    if (cache) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === "string").slice(0, max) : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function write(next: string[]) {
    cache = next.slice(0, max);
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      // storage unavailable (private mode) — keep in-memory state only
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return function useList() {
    const items = useSyncExternalStore(subscribe, read, () => EMPTY);
    return {
      items,
      max,
      has: (domain: string) => items.includes(domain),
      isFull: items.length >= max,
      toggle: (domain: string) => {
        const current = read();
        if (current.includes(domain)) write(current.filter((d) => d !== domain));
        else if (current.length < max) write([...current, domain]);
      },
      remove: (domain: string) => write(read().filter((d) => d !== domain)),
      set: (domains: string[]) => write(domains),
      clear: () => write([]),
    };
  };
}

export { MAX_COMPARE };
export const useCompare = createListStore("ai-radar:compare", MAX_COMPARE);

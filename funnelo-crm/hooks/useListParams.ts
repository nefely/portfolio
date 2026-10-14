"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Стан фільтрів/сортування/сторінки списку живе в URL: посиланням можна
 * поділитись, а "назад" у браузері повертає попередній фільтр. Значення за
 * замовчуванням в URL не пишемо — адреса лишається короткою.
 */
export function useListParams<T extends Record<string, string | number>>(defaults: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const raw = searchParams.get(String(key));
    if (raw === null) continue;
    const fallback = defaults[key];
    if (typeof fallback === "number") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) params[key] = parsed as T[keyof T];
    } else {
      params[key] = raw as T[keyof T];
    }
  }

  /** Будь-яка зміна, крім самої сторінки, повертає на першу сторінку. */
  function update(patch: Partial<T>) {
    const nextParams = { ...params, ...patch };
    if (!("page" in patch) && "page" in nextParams)
      (nextParams as Record<string, unknown>).page = 0;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(nextParams)) {
      if (value !== defaults[key] && value !== "") query.set(key, String(value));
    }
    const search = query.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  return [params, update] as const;
}

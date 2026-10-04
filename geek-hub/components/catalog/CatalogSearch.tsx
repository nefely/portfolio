"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 400;

// Локальний стан інпута окремо від URL: кожна літера рендерить лише цей
// компонент, а каталог (і запит в AniList) — лише після паузи в наборі.
export function CatalogSearch({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (q: string) => void;
}) {
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // URL змінився ззовні (кнопка "Назад", чіп "очистити") — підтягуємо текст.
  // Патерн "adjust state on prop change": без ефекту й без зайвого рендера.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== text.trim()) setText(value);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (next: string, immediate = false) => {
    setText(next);
    clearTimeout(timer.current);
    const commit = () => onSearch(next.trim());
    if (immediate) commit();
    else timer.current = setTimeout(commit, DEBOUNCE_MS);
  };

  return (
    <div className="relative min-w-0 flex-1 basis-64">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={text}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") update(text, true);
        }}
        placeholder="Search by title…"
        aria-label="Search anime by title"
        className="h-10 pr-9 pl-9"
      />
      {text && (
        <button
          type="button"
          onClick={() => update("", true)}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

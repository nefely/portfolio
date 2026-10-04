"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ANIME_SORTS, type AnimeSort } from "@/lib/anime/filters";
import { SORT_LABELS } from "@/lib/anime/labels";

const ITEMS = ANIME_SORTS.map((sort) => ({ value: sort, label: SORT_LABELS[sort] }));

export function SortSelect({
  value,
  onChange,
}: {
  value: AnimeSort;
  onChange: (sort: AnimeSort) => void;
}) {
  return (
    <Select
      items={ITEMS}
      value={value}
      onValueChange={(next) => next && onChange(next as AnimeSort)}
    >
      <SelectTrigger aria-label="Sort by" className="h-10! w-48">
        <ArrowUpDown className="text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

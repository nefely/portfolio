"use client";

import { X } from "lucide-react";
import { countActiveFilters, type AnimeFilters } from "@/lib/anime/filters";
import { AIRING_STATUS_LABELS, SEASON_LABELS, TYPE_LABELS } from "@/lib/anime/labels";

interface ActiveFiltersProps {
  filters: AnimeFilters;
  onChange: (patch: Partial<AnimeFilters>) => void;
  onReset: () => void;
}

export function ActiveFilters({ filters, onChange, onReset }: ActiveFiltersProps) {
  if (countActiveFilters(filters) === 0) return null;

  const chips: { key: string; label: string; clear: () => void }[] = [
    ...filters.genres.map((name) => ({
      key: `genre-${name}`,
      label: name,
      clear: () => onChange({ genres: filters.genres.filter((genre) => genre !== name) }),
    })),
    ...filters.tags.map((name) => ({
      key: `tag-${name}`,
      label: name,
      clear: () => onChange({ tags: filters.tags.filter((tag) => tag !== name) }),
    })),
  ];
  if (filters.type) {
    chips.push({
      key: "type",
      label: TYPE_LABELS[filters.type],
      clear: () => onChange({ type: null }),
    });
  }
  if (filters.status) {
    chips.push({
      key: "status",
      label: AIRING_STATUS_LABELS[filters.status],
      clear: () => onChange({ status: null }),
    });
  }
  if (filters.year) {
    const label = filters.season
      ? `${SEASON_LABELS[filters.season]} ${filters.year}`
      : String(filters.year);
    chips.push({ key: "year", label, clear: () => onChange({ year: null, season: null }) });
  }
  if (filters.minScore) {
    chips.push({
      key: "score",
      label: `Score ${filters.minScore}+`,
      clear: () => onChange({ minScore: null }),
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="flex items-center gap-1 rounded-full bg-secondary py-1 pr-1.5 pl-2.5 text-xs font-medium transition-colors hover:bg-accent"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="size-3 text-muted-foreground" />
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}

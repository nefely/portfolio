"use client";

import { memo, useState } from "react";
import type { GenreGroups } from "@/types/anime";
import { Button } from "@/components/ui/button";
import {
  ANIME_SEASONS,
  ANIME_STATUSES,
  ANIME_TYPES,
  MAX_YEAR,
  MIN_YEAR,
  countActiveFilters,
  type AnimeFilters,
} from "@/lib/anime/filters";
import { AIRING_STATUS_LABELS, SEASON_LABELS, TYPE_LABELS } from "@/lib/anime/labels";
import { cn } from "@/lib/utils";
import { FilterSelect } from "./FilterSelect";

interface FilterPanelProps {
  filters: AnimeFilters;
  genres: GenreGroups;
  onChange: (patch: Partial<AnimeFilters>) => void;
  onReset: () => void;
}

const YEAR_OPTIONS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => {
  const year = MAX_YEAR - index;
  return { value: year, label: String(year) };
});
const SCORE_OPTIONS = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => ({
  value: score,
  label: `${score}+`,
}));
const SEASON_OPTIONS = ANIME_SEASONS.map((season) => ({
  value: season,
  label: SEASON_LABELS[season],
}));

const toggle = (list: string[], name: string) =>
  list.includes(name) ? list.filter((item) => item !== name) : [...list, name];

export function FilterPanel({ filters, genres, onChange, onReset }: FilterPanelProps) {
  const toggleGenre = (name: string) => onChange({ genres: toggle(filters.genres, name) });
  const toggleTag = (name: string) => onChange({ tags: toggle(filters.tags, name) });

  return (
    <div className="space-y-6">
      <FilterSection title="Format">
        <ChipGroup>
          {ANIME_TYPES.map((type) => (
            <Chip
              key={type}
              active={filters.type === type}
              onClick={() => onChange({ type: filters.type === type ? null : type })}
            >
              {TYPE_LABELS[type]}
            </Chip>
          ))}
        </ChipGroup>
      </FilterSection>

      <FilterSection title="Status">
        <ChipGroup>
          {ANIME_STATUSES.map((status) => (
            <Chip
              key={status}
              active={filters.status === status}
              onClick={() => onChange({ status: filters.status === status ? null : status })}
            >
              {AIRING_STATUS_LABELS[status]}
            </Chip>
          ))}
        </ChipGroup>
      </FilterSection>

      <FilterSection title="Year & season">
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect
            label="Year"
            value={filters.year}
            options={YEAR_OPTIONS}
            anyLabel="Any year"
            onChange={(year) => onChange({ year, season: year ? filters.season : null })}
          />
          <FilterSelect
            label="Season"
            value={filters.season}
            options={SEASON_OPTIONS}
            anyLabel="Any season"
            disabled={!filters.year}
            onChange={(season) => onChange({ season })}
          />
        </div>
        {!filters.year && (
          <p className="mt-1.5 text-xs text-muted-foreground">Pick a year to filter by season.</p>
        )}
      </FilterSection>

      <FilterSection title="Minimum score">
        <FilterSelect
          label="Minimum score"
          value={filters.minScore}
          options={SCORE_OPTIONS}
          anyLabel="Any score"
          onChange={(minScore) => onChange({ minScore })}
        />
      </FilterSection>

      <NameSection
        title="Genres"
        items={genres.genres}
        selected={filters.genres}
        onToggle={toggleGenre}
      />
      <NameSection
        title="Themes"
        items={genres.themes}
        selected={filters.tags}
        onToggle={toggleTag}
      />
      <NameSection
        title="Setting"
        items={genres.settings}
        selected={filters.tags}
        onToggle={toggleTag}
      />
      <NameSection
        title="Demographics"
        items={genres.demographics}
        selected={filters.tags}
        onToggle={toggleTag}
      />

      {countActiveFilters(filters) > 0 && (
        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const COLLAPSED_COUNT = 12;

// Сотні чіпів тегів — найважча частина панелі. memo: зміна року чи формату
// не перерендерює ці групи (selected/onToggle мемоізує React Compiler).
const NameSection = memo(function NameSection({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  // Вибрані завжди видно, навіть у згорнутому стані.
  const visible = expanded
    ? items
    : items.filter((name, index) => index < COLLAPSED_COUNT || selected.includes(name));

  return (
    <FilterSection title={title}>
      <ChipGroup>
        {visible.map((name) => (
          <Chip key={name} active={selected.includes(name)} onClick={() => onToggle(name)}>
            {name}
          </Chip>
        ))}
      </ChipGroup>
      {items.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show all ${items.length}`}
        </button>
      )}
    </FilterSection>
  );
});

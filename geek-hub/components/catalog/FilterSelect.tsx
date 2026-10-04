"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Base UI Select не має окремого стану "нічого не вибрано" для пункту
// "Any", тож мапимо null ⇄ службове значення.
const ANY = "__any";

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string | number> {
  label: string;
  value: T | null;
  options: Option<T>[];
  onChange: (value: T | null) => void;
  anyLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function FilterSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  anyLabel = "Any",
  disabled,
  className,
}: FilterSelectProps<T>) {
  const items = [
    { value: ANY, label: anyLabel },
    ...options.map((option) => ({ value: String(option.value), label: option.label })),
  ];

  return (
    <Select
      items={items}
      value={value === null ? ANY : String(value)}
      disabled={disabled}
      onValueChange={(next) => {
        if (next === null || next === ANY) return onChange(null);
        const option = options.find((candidate) => String(candidate.value) === next);
        onChange(option ? option.value : null);
      }}
    >
      <SelectTrigger aria-label={label} className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

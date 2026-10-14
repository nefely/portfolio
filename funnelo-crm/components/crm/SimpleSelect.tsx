"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: ReactNode };

// Значення "нічого не вибрано" — порожній рядок: так його зручно класти в URL
// і форми, а base-ui Select отримує null.
export function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  name,
  id,
  className,
  disabled,
  size = "default",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "default";
}) {
  return (
    <Select
      items={options}
      value={value === "" ? null : value}
      onValueChange={(next) => onChange((next as string | null) ?? "")}
      name={name}
      disabled={disabled}
    >
      <SelectTrigger id={id} size={size} className={cn("w-full min-w-0", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-72">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

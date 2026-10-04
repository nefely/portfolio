"use client";

import { Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "none";
const SCORE_WORDS = [
  "",
  "Appalling",
  "Horrible",
  "Very bad",
  "Bad",
  "Average",
  "Fine",
  "Good",
  "Very good",
  "Great",
  "Masterpiece",
];
const ITEMS = [
  { value: NONE, label: "No score" },
  ...Array.from({ length: 10 }, (_, index) => {
    const score = 10 - index;
    return { value: String(score), label: `${score} — ${SCORE_WORDS[score]}` };
  }),
];

export function ScoreSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (score: number | null) => void;
}) {
  return (
    <Select
      items={ITEMS}
      value={value === null ? NONE : String(value)}
      onValueChange={(next) => onChange(next === null || next === NONE ? null : Number(next))}
    >
      <SelectTrigger aria-label="Your score" className="h-9! w-36">
        <Star className="fill-amber-400 text-amber-400" />
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

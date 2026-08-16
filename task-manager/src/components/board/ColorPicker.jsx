"use client";

import { Check } from "lucide-react";

export const COLUMN_COLORS = [
  { value: "#3b82f6", name: "Blue" },
  { value: "#8b5cf6", name: "Violet" },
  { value: "#ec4899", name: "Pink" },
  { value: "#f43f5e", name: "Rose" },
  { value: "#f59e0b", name: "Amber" },
  { value: "#10b981", name: "Emerald" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#64748b", name: "Slate" },
];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="w-max">
      <p className="mb-2 px-0.5 text-xs font-medium tracking-wide text-slate-400 uppercase">
        Column color
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {COLUMN_COLORS.map((color) => {
          const selected = value === color.value;
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              aria-label={color.name}
              title={color.name}
              className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: color.value,
                boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${color.value}` : undefined,
              }}
            >
              {selected && <Check size={15} className="text-white drop-shadow-sm" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

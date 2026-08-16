"use client";

export const COLUMN_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#64748b", // slate
];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 p-1">
      {COLUMN_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={`Choose color ${color}`}
          className={`h-6 w-6 rounded-full transition hover:scale-110 ${
            value === color ? "ring-2 ring-offset-2 ring-slate-400" : ""
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

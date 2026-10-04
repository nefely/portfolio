"use client";

import { useEntry } from "@/hooks/useEntries";
import { ENTRY_STATUS_LABELS, ENTRY_STATUS_STYLES } from "@/lib/anime/labels";
import { cn } from "@/lib/utils";

// Підписується лише на свій тайтл (useEntry → select), тож зміна статусу
// одного аніме перерендерює рівно один бейдж.
export function EntryStatusBadge({ animeId, className }: { animeId: number; className?: string }) {
  const entry = useEntry(animeId);
  if (!entry) return null;

  const styles = ENTRY_STATUS_STYLES[entry.status];
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm",
        styles.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} />
      {ENTRY_STATUS_LABELS[entry.status]}
    </span>
  );
}

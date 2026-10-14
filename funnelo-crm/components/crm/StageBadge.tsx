import { cn } from "@/lib/utils";
import type { Stage } from "@/types/crm";

/** Бейдж етапу: колір приходить із БД, тож фон — напівпрозорий через color-mix. */
export function StageBadge({
  stage,
  className,
}: {
  stage: Pick<Stage, "name" | "color"> | undefined;
  className?: string;
}) {
  if (!stage) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        className,
      )}
      style={{
        color: `color-mix(in oklch, ${stage.color} 85%, var(--foreground))`,
        backgroundColor: `color-mix(in oklch, ${stage.color} 14%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
      {stage.name}
    </span>
  );
}

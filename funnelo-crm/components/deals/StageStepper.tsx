"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stage } from "@/types/crm";

/**
 * Відкриті етапи як кроки: пройдені — заповнені, поточний — підсвічений.
 * Клік по кроку переводить угоду на цей етап (якщо є права).
 */
export function StageStepper({
  stages,
  currentId,
  closed,
  disabled,
  onSelect,
}: {
  stages: Stage[];
  currentId: string;
  closed: boolean;
  disabled: boolean;
  onSelect: (stageId: string) => void;
}) {
  const currentIndex = stages.findIndex((stage) => stage.id === currentId);

  return (
    <ol className="flex overflow-hidden rounded-lg border bg-card">
      {stages.map((stage, index) => {
        const reached = closed || index <= currentIndex;
        const current = !closed && index === currentIndex;
        return (
          <li key={stage.id} className="min-w-0 flex-1">
            <button
              type="button"
              disabled={disabled || current}
              onClick={() => onSelect(stage.id)}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-1.5 truncate border-r px-2 text-xs font-medium transition-colors last:border-r-0 sm:text-sm",
                reached ? "text-foreground" : "text-muted-foreground",
                !disabled && !current && "hover:bg-muted",
                disabled && "cursor-default",
              )}
              style={
                reached
                  ? {
                      backgroundColor: `color-mix(in oklch, ${stage.color} ${current ? 22 : 10}%, transparent)`,
                    }
                  : undefined
              }
              aria-current={current ? "step" : undefined}
              title={`${stage.name} · ${stage.probability}%`}
            >
              {reached && !current && <Check className="size-3.5 shrink-0" />}
              <span className="truncate">{stage.name}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

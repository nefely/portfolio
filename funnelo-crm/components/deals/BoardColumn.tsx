"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoneyCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealRow, Profile, Stage } from "@/types/crm";
import { SortableDealCard } from "./DealCard";

export function BoardColumn({
  stage,
  deals,
  team,
  today,
  canMove,
  onAdd,
}: {
  stage: Stage;
  deals: DealRow[];
  team: Map<string, Profile> | undefined;
  today: string;
  canMove: (deal: DealRow) => boolean;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <section
      aria-label={`${stage.name} stage`}
      className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/50"
    >
      <header
        className="flex items-center gap-2 border-t-2 px-3 pt-3 pb-2"
        style={{ borderTopColor: stage.color }}
      >
        <h2 className="text-sm font-semibold">{stage.name}</h2>
        <span className="rounded-full bg-background px-1.5 text-xs text-muted-foreground tabular-nums">
          {deals.length}
        </span>
        <span
          className="ml-auto text-xs text-muted-foreground tabular-nums"
          title={`${stage.probability}% probability`}
        >
          {formatMoneyCompact(total)}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onAdd}
          aria-label={`Add deal to ${stage.name}`}
        >
          <Plus />
        </Button>
      </header>

      <SortableContext
        id={stage.id}
        items={deals.map((deal) => deal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-32 flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors",
            isOver && "bg-primary/5",
          )}
        >
          {deals.map((deal) => (
            <SortableDealCard
              key={deal.id}
              deal={deal}
              owner={deal.owner_id ? team?.get(deal.owner_id) : undefined}
              today={today}
              locked={!canMove(deal)}
            />
          ))}
          {deals.length === 0 && (
            <p className="grid flex-1 place-items-center rounded-lg border border-dashed py-6 text-xs text-muted-foreground">
              Drop deals here
            </p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

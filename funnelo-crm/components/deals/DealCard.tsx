"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, CalendarClock, Lock } from "lucide-react";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { formatMoney, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealRow, Profile } from "@/types/crm";

type CardProps = {
  deal: DealRow;
  owner: Profile | undefined;
  /** "YYYY-MM-DD" — передається згори, щоб не читати час у кожній картці. */
  today: string;
  locked?: boolean;
};

export function DealCard({
  deal,
  owner,
  today,
  locked,
  overlay,
}: CardProps & { overlay?: boolean }) {
  const overdue = deal.expected_close_date !== null && deal.expected_close_date < today;

  return (
    <div
      className={cn(
        "group/card relative rounded-lg border bg-card p-3 text-sm shadow-xs transition-shadow",
        overlay ? "rotate-1 cursor-grabbing shadow-lg ring-2 ring-primary/30" : "hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Посилання розтягнуте на всю картку (after:inset-0), але drag
            стартує лише після зсуву на 5px — клік лишається кліком. */}
        <Link
          href={`/deals/${deal.id}`}
          className="line-clamp-2 font-medium after:absolute after:inset-0 after:content-[''] hover:underline"
          draggable={false}
        >
          {deal.title}
        </Link>
        <PersonAvatar person={owner} size="xs" className="mt-px" />
      </div>

      {deal.company && (
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Building2 className="size-3 shrink-0" />
          {deal.company.name}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums">{formatMoney(deal.value)}</span>
        <span className="flex items-center gap-2">
          {deal.expected_close_date && (
            <span
              className={cn(
                "flex items-center gap-1 text-muted-foreground",
                overdue && "font-medium text-destructive",
              )}
              title={overdue ? "Expected close date has passed" : "Expected close date"}
            >
              <CalendarClock className="size-3" />
              {formatShortDate(deal.expected_close_date)}
            </span>
          )}
          {locked && (
            <Lock className="size-3 text-muted-foreground/60" aria-label="Owned by another rep" />
          )}
        </span>
      </div>
    </div>
  );
}

export function SortableDealCard(props: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.deal.id,
    // Чужі угоди перетягувати не можна — RLS однаково відхилить оновлення.
    disabled: props.locked,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "touch-manipulation",
        !props.locked && "cursor-grab",
        isDragging && "opacity-40",
      )}
      {...attributes}
      {...listeners}
    >
      <DealCard {...props} />
    </div>
  );
}

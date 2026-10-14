"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AnimatePresence, m } from "motion/react";
import { ThumbsDown, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/components/providers/MeProvider";
import { useMoveDeal } from "@/hooks/useMoveDeal";
import { useOpenStages, useStages, useTeamMap } from "@/hooks/useTeam";
import {
  type Columns,
  buildColumns,
  findColumn,
  moveAcross,
  positionInColumn,
  reorderWithin,
} from "@/lib/board";
import { todayIso } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import { boardOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { DealRow } from "@/types/crm";
import { BoardColumn } from "./BoardColumn";
import { DealCard } from "./DealCard";
import { type DealDefaults, DealFormDialog } from "./DealFormDialog";
import { LostReasonDialog } from "./LostReasonDialog";

const WON_ZONE = "zone:won";
const LOST_ZONE = "zone:lost";

// Зони Won/Lost маленькі й лежать поверх колонок — для них перевіряємо саме
// курсор; для колонок і карток — найближчі кути (стабільніше між колонками).
const collisionDetection: CollisionDetection = (args) => {
  const zones = pointerWithin(args).filter(({ id }) => id === WON_ZONE || id === LOST_ZONE);
  return zones.length > 0 ? zones : closestCorners(args);
};

const DROP_ANIMATION = { duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" };

type Filters = { search: string; ownerId: string };

type DragState = {
  /** null — картку вже відпущено, чекаємо на оновлення кешу. */
  activeId: string | null;
  columns: Columns;
  /** Колонки на момент старту — для скасування й Lost (картка повертається). */
  start: Columns;
  overZone: string | null;
  /** Кеш і фільтри, з яких побудовано `columns`. */
  basis: DealRow[] | undefined;
  filtersKey: string;
};

function removeFromColumns(columns: Columns, id: string): Columns {
  return Object.fromEntries(
    Object.entries(columns).map(([stageId, ids]) => [stageId, ids.filter((item) => item !== id)]),
  );
}

export function DealBoard({ filters }: { filters: Filters }) {
  const me = useMe();
  const team = useTeamMap();
  const { data: stages = [] } = useStages();
  const { data: openStages, isPending: stagesPending } = useOpenStages();
  const { data: deals, isPending: dealsPending } = useQuery(boardOptions());
  const moveDeal = useMoveDeal();
  const [today] = useState(todayIso);

  // Під час перетягування колонки живуть локально (щоб картка "їхала" між
  // ними). Після відпускання вони ще тримаються, доки не оновиться кеш
  // (оптимістичне оновлення асинхронне) — інакше на один кадр дошка
  // намалювалась би зі старих даних: картка "відлітала" б у стару колонку.
  const [drag, setDrag] = useState<DragState | null>(null);
  const [creatingIn, setCreatingIn] = useState<DealDefaults | null>(null);
  const [pendingLost, setPendingLost] = useState<{ deal: DealRow; position: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (stagesPending || dealsPending || !openStages || !deals) return <BoardSkeleton />;

  const query = filters.search.trim().toLowerCase();
  const visible = deals.filter(
    (deal) =>
      (!filters.ownerId || deal.owner_id === filters.ownerId) &&
      (!query ||
        deal.title.toLowerCase().includes(query) ||
        deal.company?.name.toLowerCase().includes(query)),
  );
  const byId = new Map(visible.map((deal) => [deal.id, deal]));
  const filtersKey = `${filters.ownerId}|${query}`;
  // Локальні колонки діють, поки триває drag, або поки кеш ще той самий, з
  // якого стартували (тобто оптимістичне оновлення ще не застосувалось).
  const keepLocal =
    drag !== null &&
    (drag.activeId !== null || (drag.basis === deals && drag.filtersKey === filtersKey));
  const columns = keepLocal ? drag.columns : buildColumns(visible, openStages);
  const activeDeal = drag?.activeId ? byId.get(drag.activeId) : undefined;
  const wonStage = stages.find((stage) => stage.kind === "won");
  const lostStage = stages.find((stage) => stage.kind === "lost");

  function handleDragStart({ active }: DragStartEvent) {
    const start = buildColumns(visible, openStages ?? []);
    setDrag({
      activeId: String(active.id),
      columns: start,
      start,
      overZone: null,
      basis: deals,
      filtersKey,
    });
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!drag) return;
    const overId = over ? String(over.id) : null;
    const overZone = overId === WON_ZONE || overId === LOST_ZONE ? overId : null;
    const next =
      overId && !overZone ? moveAcross(drag.columns, String(active.id), overId) : drag.columns;
    if (next !== drag.columns || overZone !== drag.overZone)
      setDrag({ ...drag, columns: next, overZone });
  }

  /** Завершити drag, лишивши дошку в стані `columns` до оновлення кешу. */
  function settle(current: DragState, columns: Columns) {
    setDrag({ ...current, activeId: null, columns });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const current = drag;
    if (!current) return;
    const deal = byId.get(String(active.id));
    if (!over || !deal) return settle(current, current.start);

    if (over.id === WON_ZONE && wonStage) {
      settle(current, removeFromColumns(current.start, deal.id));
      moveDeal.mutate({ id: deal.id, stageId: wonStage.id, kind: "won", position: deal.position });
      return;
    }
    if (over.id === LOST_ZONE && lostStage) {
      // Картка повертається на місце, доки користувач не підтвердить причину.
      settle(current, current.start);
      setPendingLost({ deal, position: deal.position });
      return;
    }

    const finalColumns = reorderWithin(current.columns, deal.id, String(over.id));
    const stageId = findColumn(finalColumns, deal.id);
    if (!stageId) return settle(current, current.start);

    const positions = new Map(visible.map((item) => [item.id, item.position]));
    const position = positionInColumn(finalColumns[stageId], deal.id, positions);
    settle(current, finalColumns);
    if (stageId === deal.stage_id && position === deal.position) return;
    moveDeal.mutate({ id: deal.id, stageId, kind: "open", position });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => drag && settle(drag, drag.start)}
        // Зони Won/Lost з'являються вже після старту drag (і ще анімуються) —
        // без постійного вимірювання dnd-kit не знав би їхніх координат.
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      >
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex min-h-[60vh] gap-3">
            {openStages.map((stage) => (
              <BoardColumn
                key={stage.id}
                stage={stage}
                deals={(columns[stage.id] ?? []).flatMap((id) => byId.get(id) ?? [])}
                team={team}
                today={today}
                canMove={(deal) => canEdit(me, deal.owner_id)}
                onAdd={() => setCreatingIn({ stage_id: stage.id })}
              />
            ))}
          </div>
        </div>

        {/* Центрування — на обгортці, анімація — на внутрішньому елементі,
            щоб transform від Motion не перетер translate-x. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 lg:pl-60">
          <AnimatePresence>
            {drag?.activeId && (
              <m.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-auto grid w-full max-w-md grid-cols-2 gap-3"
              >
                <FinalZone id={WON_ZONE} label="Won" icon={<Trophy />} tone="success" />
                <FinalZone id={LOST_ZONE} label="Lost" icon={<ThumbsDown />} tone="destructive" />
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Після відпускання оверлей "доїжджає" до нового місця картки. У Won
            картка зникає з дошки — летіти нікуди, тож без анімації. */}
        <DragOverlay dropAnimation={drag?.overZone === WON_ZONE ? null : DROP_ANIMATION}>
          {activeDeal && (
            <DealCard
              deal={activeDeal}
              owner={activeDeal.owner_id ? team?.get(activeDeal.owner_id) : undefined}
              today={today}
              overlay
            />
          )}
        </DragOverlay>
      </DndContext>

      <DealFormDialog
        open={creatingIn !== null}
        onOpenChange={(open) => !open && setCreatingIn(null)}
        defaults={creatingIn ?? undefined}
      />

      <LostReasonDialog
        dealTitle={pendingLost?.deal.title ?? null}
        onCancel={() => setPendingLost(null)}
        onConfirm={(reason) => {
          if (pendingLost && lostStage) {
            moveDeal.mutate({
              id: pendingLost.deal.id,
              stageId: lostStage.id,
              kind: "lost",
              position: pendingLost.position,
              lostReason: reason,
            });
          }
          setPendingLost(null);
        }}
      />
    </>
  );
}

function FinalZone({
  id,
  label,
  icon,
  tone,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  tone: "success" | "destructive";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-16 items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background/95 text-sm font-semibold shadow-lg backdrop-blur transition-colors [&_svg]:size-4",
        tone === "success"
          ? "border-success/50 text-success"
          : "border-destructive/50 text-destructive",
        isOver &&
          (tone === "success"
            ? "border-success bg-success/10"
            : "border-destructive bg-destructive/10"),
      )}
    >
      {icon} {label}
    </div>
  );
}

// Колонки й картки тієї ж форми, що й справжні (DealCard): назва, компанія,
// сума й дата — під час завантаження дошка не "стрибає".
function BoardSkeleton() {
  return (
    <div aria-busy aria-label="Loading board" className="flex min-h-[60vh] gap-3 overflow-hidden">
      {Array.from({ length: 4 }, (_, column) => (
        <div key={column} className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 border-t-2 border-muted px-3 pt-3 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
            <Skeleton className="ml-auto h-3 w-12" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 4 - (column % 3) }, (_, card) => (
              <div key={card} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton
                    className="h-4"
                    style={{ width: `${75 - ((column + card) % 3) * 12}%` }}
                  />
                  <Skeleton className="size-5 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-3 w-1/2" />
                <div className="mt-3 flex justify-between">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

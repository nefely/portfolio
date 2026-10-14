import type { DealRow, Stage } from "@/types/crm";
import { positionAt } from "./position";

/** Колонки канбану: stageId → id угод у порядку position. */
export type Columns = Record<string, string[]>;

export function buildColumns(deals: DealRow[], stages: Stage[]): Columns {
  const columns: Columns = Object.fromEntries(stages.map((stage) => [stage.id, [] as string[]]));
  const sorted = [...deals].sort((a, b) => a.position - b.position);
  for (const deal of sorted) columns[deal.stage_id]?.push(deal.id);
  return columns;
}

export function findColumn(columns: Columns, id: string): string | undefined {
  if (id in columns) return id;
  return Object.keys(columns).find((stageId) => columns[stageId].includes(id));
}

/**
 * Перенос картки в іншу колонку під час перетягування (onDragOver), щоб
 * користувач бачив, куди вона ляже. overId — картка, над якою курсор, або
 * сама колонка (тоді — у кінець).
 */
export function moveAcross(columns: Columns, activeId: string, overId: string): Columns {
  const from = findColumn(columns, activeId);
  const to = findColumn(columns, overId);
  if (!from || !to || from === to) return columns;

  const target = columns[to].filter((id) => id !== activeId);
  const overIndex = target.indexOf(overId);
  const index = overIndex === -1 ? target.length : overIndex;
  target.splice(index, 0, activeId);

  return { ...columns, [from]: columns[from].filter((id) => id !== activeId), [to]: target };
}

/** Перестановка в межах однієї колонки (onDragEnd). */
export function reorderWithin(columns: Columns, activeId: string, overId: string): Columns {
  const column = findColumn(columns, activeId);
  if (!column || findColumn(columns, overId) !== column) return columns;

  const ids = columns[column];
  const from = ids.indexOf(activeId);
  const to = overId === column ? ids.length - 1 : ids.indexOf(overId);
  if (from === to || to === -1) return columns;

  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, activeId);
  return { ...columns, [column]: next };
}

/**
 * Нова position картки за її місцем у колонці: середнє між сусідами.
 * Сусіди беруться з поточних даних, тож оновлюється лише одна угода.
 */
export function positionInColumn(
  columnIds: string[],
  activeId: string,
  positions: Map<string, number>,
) {
  const index = columnIds.indexOf(activeId);
  const neighbours = columnIds.filter((id) => id !== activeId).map((id) => positions.get(id) ?? 0);
  return positionAt(neighbours, index);
}

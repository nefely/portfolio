// Дробовий порядок карток у колонці канбану: нова позиція — середнє сусідів,
// тож перетягування оновлює один рядок у БД, а не перенумеровує всю колонку.
// double precision витримує ~50 послідовних вставок в одну й ту саму щілину;
// для CRM-воронки цього з запасом.

export const POSITION_STEP = 1000;

export function positionBetween(before: number | undefined, after: number | undefined) {
  if (before === undefined && after === undefined) return POSITION_STEP;
  if (before === undefined) return (after as number) - POSITION_STEP;
  if (after === undefined) return before + POSITION_STEP;
  return (before + after) / 2;
}

/** Позиція для вставки на індекс `index` у вже відсортований список (без самої картки). */
export function positionAt(sortedPositions: number[], index: number) {
  return positionBetween(sortedPositions[index - 1], sortedPositions[index]);
}

// Fractional-indexing helper: lets us move a card/column between two
// neighbours by giving it a position "in between" theirs, so a drag-and-drop
// move only ever needs to write the ONE row that moved — never the whole
// column/board.
const GAP = 1000;

export function positionBetween(before, after) {
  if (before == null && after == null) return GAP;
  if (before == null) return after - GAP;
  if (after == null) return before + GAP;
  return (before + after) / 2;
}

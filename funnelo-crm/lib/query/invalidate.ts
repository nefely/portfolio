import type { QueryClient } from "@tanstack/react-query";

// Що застаріває після зміни сутності. Угоди вбудовують назви компаній і
// контактів, а view компаній рахує суми угод — тому залежності перехресні.
// invalidateQueries перезапитує лише активні запити; решта просто стає stale
// і оновиться при наступному відкритті сторінки.
const DEPENDENTS = {
  deals: [["deals"], ["dashboard"], ["companies"], ["activities"]],
  companies: [["companies"], ["deals"], ["contacts"], ["activities"]],
  contacts: [["contacts"], ["deals"], ["companies"], ["activities"]],
  activities: [["activities"]],
  stages: [["stages"], ["deals"], ["dashboard"]],
  team: [["team"], ["dashboard"]],
} as const;

export type Entity = keyof typeof DEPENDENTS;

export function invalidateEntity(
  queryClient: QueryClient,
  entity: Entity,
  refetchType: "active" | "none" = "active",
) {
  return Promise.all(
    DEPENDENTS[entity].map((queryKey) => queryClient.invalidateQueries({ queryKey, refetchType })),
  );
}

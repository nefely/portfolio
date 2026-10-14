"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateDeal } from "@/lib/data/deals";
import { invalidateEntity } from "@/lib/query/invalidate";
import { queryKeys } from "@/lib/query/keys";
import type { DealRow, StageKind } from "@/types/crm";

type Move = {
  id: string;
  stageId: string;
  /** Тип цільового етапу: won/lost прибирають картку з канбану одразу. */
  kind: StageKind;
  position: number;
  lostReason?: string | null;
};

/**
 * Оптимістичне переміщення угоди: кеш канбану змінюється миттєво, запит іде
 * у фоні, а при помилці (наприклад, RLS) — відкат до знімка й toast.
 */
export function useMoveDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stageId, position, lostReason }: Move) =>
      updateDeal(createClient(), id, {
        stage_id: stageId,
        position,
        ...(lostReason !== undefined ? { lost_reason: lostReason } : {}),
      }),

    onMutate: async (move) => {
      // Запит, що вже летить, міг би перезаписати оптимістичний стан старими даними.
      await queryClient.cancelQueries({ queryKey: queryKeys.board });
      const previous = queryClient.getQueryData<DealRow[]>(queryKeys.board);

      queryClient.setQueryData<DealRow[]>(queryKeys.board, (deals = []) =>
        move.kind === "open"
          ? deals.map((deal) =>
              deal.id === move.id
                ? { ...deal, stage_id: move.stageId, position: move.position }
                : deal,
            )
          : deals.filter((deal) => deal.id !== move.id),
      );
      return { previous };
    },

    onSuccess: (deal, move) => {
      if (move.kind === "won") toast.success(`Won: ${deal.title}`);
      if (move.kind === "lost") toast(`Marked as lost: ${deal.title}`);
    },

    onError: (error, _move, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.board, context.previous);
      toast.error(error.message);
    },

    // Таблиця, дашборд і картка угоди теж залежать від етапу.
    onSettled: () => invalidateEntity(queryClient, "deals"),
  });
}

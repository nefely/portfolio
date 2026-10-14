"use client";

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Db } from "@/lib/data/shared";
import { type Entity, invalidateEntity } from "@/lib/query/invalidate";

/**
 * Мутація з однаковою поведінкою по всьому застосунку: після успіху —
 * інвалідація залежних гілок кешу (lib/query/invalidate.ts) і toast; при
 * помилці — toast з людським текстом (lib/data/shared.ts → describeDbError).
 */
export function useCrmMutation<TVariables, TData>({
  mutationFn,
  entity,
  success,
  onSuccess,
  refetch = true,
}: {
  mutationFn: (db: Db, variables: TVariables) => Promise<TData>;
  entity: Entity | Entity[];
  success?: string | ((data: TData, variables: TVariables) => string);
  /**
   * Викликається ДО інвалідації — щоб покласти відповідь сервера прямо в кеш
   * картки (екран оновлюється без очікування повторного запиту).
   */
  onSuccess?: (data: TData, variables: TVariables, queryClient: QueryClient) => void;
  /**
   * false — лише позначити кеш застарілим, без негайного перезапиту. Для
   * видалень: інакше відкрита сторінка запису встигла б перезапитати вже
   * видалений рядок до переходу на список.
   */
  refetch?: boolean;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => mutationFn(createClient(), variables),
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables, queryClient);
      for (const item of Array.isArray(entity) ? entity : [entity]) {
        invalidateEntity(queryClient, item, refetch ? "active" : "none");
      }
      if (success)
        toast.success(typeof success === "function" ? success(data, variables) : success);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

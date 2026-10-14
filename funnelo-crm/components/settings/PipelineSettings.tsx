"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/crm/ConfirmDialog";
import { PageHeader } from "@/components/crm/PageHeader";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { useStages } from "@/hooks/useTeam";
import {
  type StageInput,
  createStage,
  deleteStage,
  reorderStages,
  updateStage,
} from "@/lib/data/stages";
import type { Stage } from "@/types/crm";

const STAGE_COLORS = [
  "#64748b",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#14b8a6",
  "#10b981",
];

export function PipelineSettings() {
  const { data: stages, isPending } = useStages();
  const [deleting, setDeleting] = useState<Stage | null>(null);

  const open = (stages ?? []).filter((stage) => stage.kind === "open");
  const final = (stages ?? []).filter((stage) => stage.kind !== "open");

  const save = useCrmMutation({
    mutationFn: (db, { id, patch }: { id: string; patch: Partial<StageInput> }) =>
      updateStage(db, id, patch),
    entity: "stages",
    success: "Stage saved",
  });

  const add = useCrmMutation({
    mutationFn: (db) =>
      createStage(
        db,
        {
          name: "New stage",
          probability: 50,
          color: STAGE_COLORS[open.length % STAGE_COLORS.length],
        },
        open.length + 1,
      ),
    entity: "stages",
    success: "Stage added",
  });

  // Відкриті етапи — у новому порядку, фінальні (Won/Lost) завжди в кінці.
  const reorder = useCrmMutation({
    mutationFn: (db, orderedOpenIds: string[]) =>
      reorderStages(db, [...orderedOpenIds, ...final.map((s) => s.id)]),
    entity: "stages",
  });

  const remove = useCrmMutation({
    mutationFn: (db, id: string) => deleteStage(db, id),
    entity: "stages",
    success: "Stage deleted",
  });

  function move(index: number, direction: -1 | 1) {
    const ids = open.map((stage) => stage.id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="Pipeline"
        description="Stages every deal moves through. Probability drives the weighted forecast on the dashboard."
        actions={
          <Button
            size="sm"
            onClick={() => add.mutate(undefined)}
            disabled={add.isPending || isPending}
          >
            <Plus /> Add stage
          </Button>
        }
      />

      <div className="divide-y rounded-xl border bg-card">
        {isPending
          ? Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="p-3">
                <Skeleton className="h-8" />
              </div>
            ))
          : [...open, ...final].map((stage) => {
              const openIndex = open.indexOf(stage);
              return (
                <StageRow
                  // Ключ із полями: після збереження/перезапиту рядок
                  // перемонтовується з новими defaultValue.
                  key={`${stage.id}:${stage.name}:${stage.probability}:${stage.color}`}
                  stage={stage}
                  disabled={save.isPending || reorder.isPending}
                  onSave={(patch) => save.mutate({ id: stage.id, patch })}
                  onMoveUp={openIndex > 0 ? () => move(openIndex, -1) : undefined}
                  onMoveDown={
                    openIndex >= 0 && openIndex < open.length - 1
                      ? () => move(openIndex, 1)
                      : undefined
                  }
                  onDelete={
                    stage.kind === "open" && open.length > 1 ? () => setDeleting(stage) : undefined
                  }
                />
              );
            })}
      </div>

      <p className="text-xs text-muted-foreground">
        Won and Lost are fixed final stages: rename or recolor them, but they can’t be removed.
      </p>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description="Only empty stages can be deleted. Move its deals to another stage first."
        onConfirm={() => (deleting ? remove.mutateAsync(deleting.id) : Promise.resolve())}
      />
    </div>
  );
}

function StageRow({
  stage,
  disabled,
  onSave,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  stage: Stage;
  disabled: boolean;
  onSave: (patch: Partial<StageInput>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}) {
  const [color, setColor] = useState(stage.color);
  const isFinal = stage.kind !== "open";

  // Зберігаємо при втраті фокусу — без окремої кнопки на кожен рядок.
  function commitName(value: string) {
    const name = value.trim();
    if (name && name !== stage.name) onSave({ name: name.slice(0, 40) });
  }

  function commitProbability(value: string) {
    const probability = Math.round(Number(value));
    if (
      Number.isFinite(probability) &&
      probability >= 0 &&
      probability <= 100 &&
      probability !== stage.probability
    ) {
      onSave({ probability });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-3">
      <div className="flex flex-col">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onMoveUp}
          disabled={!onMoveUp || disabled}
          aria-label="Move up"
        >
          <ArrowUp />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onMoveDown}
          disabled={!onMoveDown || disabled}
          aria-label="Move down"
        >
          <ArrowDown />
        </Button>
      </div>

      <label
        className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-border"
        style={{ backgroundColor: color }}
      >
        <span className="sr-only">Stage color</span>
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          onBlur={() => color !== stage.color && onSave({ color })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <Input
        defaultValue={stage.name}
        onBlur={(event) => commitName(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        maxLength={40}
        className="h-8 min-w-36 flex-1"
        aria-label="Stage name"
      />

      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          max={100}
          defaultValue={stage.probability}
          disabled={isFinal}
          onBlur={(event) => commitProbability(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
          className="h-8 w-20 text-right tabular-nums"
          aria-label="Win probability"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>

      <div className="flex w-8 justify-center">
        {isFinal ? (
          <Lock className="size-4 text-muted-foreground" aria-label="Final stage" />
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={!onDelete || disabled}
            aria-label="Delete stage"
          >
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  );
}

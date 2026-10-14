"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, RotateCcw, ThumbsDown, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { ConfirmDialog } from "@/components/crm/ConfirmDialog";
import {
  BackLink,
  DetailCard,
  DetailRow,
  DetailSkeleton,
  NotFoundCard,
} from "@/components/crm/DetailBits";
import { PersonLabel } from "@/components/crm/PersonAvatar";
import { StageBadge } from "@/components/crm/StageBadge";
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { useStages, useTeamMap } from "@/hooks/useTeam";
import { deleteDeal, updateDeal } from "@/lib/data/deals";
import { formatDate, formatMoney } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import { queryKeys } from "@/lib/query/keys";
import { dealOptions } from "@/lib/query/options";
import { DealFormDialog } from "./DealFormDialog";
import { LostReasonDialog } from "./LostReasonDialog";
import { StageStepper } from "./StageStepper";

export function DealDetail({ id }: { id: string }) {
  const me = useMe();
  const router = useRouter();
  const team = useTeamMap();
  const { data: stages = [] } = useStages();
  const { data: deal, isPending, isError } = useQuery(dealOptions(id));
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [askLostReason, setAskLostReason] = useState(false);

  const move = useCrmMutation({
    mutationFn: (db, patch: { stage_id: string; lost_reason?: string | null }) =>
      updateDeal(db, id, patch),
    entity: "deals",
    success: (saved) =>
      `Moved to ${stages.find((stage) => stage.id === saved.stage_id)?.name ?? "new stage"}`,
    onSuccess: (saved, _patch, queryClient) => queryClient.setQueryData(queryKeys.deal(id), saved),
  });

  const remove = useCrmMutation({
    mutationFn: (db) => deleteDeal(db, id),
    entity: "deals",
    success: "Deal deleted",
    refetch: false,
  });

  if (isPending) return <DetailSkeleton />;
  if (isError || !deal)
    return <NotFoundCard backHref="/deals" backLabel="Back to deals" what="deal" />;

  const stage = stages.find((item) => item.id === deal.stage_id);
  const openStages = stages.filter((item) => item.kind === "open");
  const wonStage = stages.find((item) => item.kind === "won");
  const lostStage = stages.find((item) => item.kind === "lost");
  const closed = stage?.kind !== "open";
  const editable = canEdit(me, deal.owner_id);
  const owner = deal.owner_id ? team?.get(deal.owner_id) : null;

  return (
    <div className="space-y-6">
      <BackLink href="/deals" label="Deals" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{deal.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <StageBadge stage={stage} />
            <span className="text-lg font-semibold text-foreground tabular-nums">
              {formatMoney(deal.value)}
            </span>
            {deal.company && (
              <Link
                href={`/companies/${deal.company.id}`}
                className="hover:text-foreground hover:underline"
              >
                {deal.company.name}
              </Link>
            )}
          </div>
        </div>

        {editable && (
          <div className="flex items-center gap-2">
            {closed ? (
              <Button
                variant="outline"
                size="sm"
                disabled={move.isPending}
                onClick={() =>
                  openStages.at(-1) && move.mutate({ stage_id: openStages.at(-1)!.id })
                }
              >
                <RotateCcw /> Reopen
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  className="bg-success text-white hover:bg-success/90"
                  disabled={move.isPending || !wonStage}
                  onClick={() => wonStage && move.mutate({ stage_id: wonStage.id })}
                >
                  <Trophy /> Won
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={move.isPending}
                  onClick={() => setAskLostReason(true)}
                >
                  <ThumbsDown /> Lost
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label="More actions" />}
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <StageStepper
        stages={openStages}
        currentId={deal.stage_id}
        closed={closed}
        disabled={!editable || move.isPending}
        onSelect={(stageId) => move.mutate({ stage_id: stageId })}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <ActivityTimeline
          kind="deal"
          id={deal.id}
          link={{ deal_id: deal.id, company_id: deal.company_id, contact_id: deal.contact_id }}
        />

        <div className="space-y-6">
          <DetailCard
            title="Details"
            action={
              editable && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  aria-label="Edit deal"
                >
                  <Pencil />
                </Button>
              )
            }
          >
            <dl>
              <DetailRow label="Owner">
                <PersonLabel person={owner} />
              </DetailRow>
              <DetailRow label="Company">
                {deal.company && (
                  <Link href={`/companies/${deal.company.id}`} className="hover:underline">
                    {deal.company.name}
                  </Link>
                )}
              </DetailRow>
              <DetailRow label="Contact">
                {deal.contact && (
                  <Link href={`/contacts/${deal.contact.id}`} className="hover:underline">
                    {deal.contact.full_name}
                  </Link>
                )}
              </DetailRow>
              <DetailRow label="Probability">{stage && `${stage.probability}%`}</DetailRow>
              <DetailRow label="Expected close">
                {deal.expected_close_date && formatDate(deal.expected_close_date)}
              </DetailRow>
              {closed && <DetailRow label="Closed">{formatDate(deal.closed_at)}</DetailRow>}
              {stage?.kind === "lost" && (
                <DetailRow label="Lost reason">{deal.lost_reason}</DetailRow>
              )}
              <DetailRow label="Created">{formatDate(deal.created_at)}</DetailRow>
            </dl>
            {deal.notes && (
              <p className="mt-3 border-t pt-3 text-sm whitespace-pre-line text-muted-foreground">
                {deal.notes}
              </p>
            )}
          </DetailCard>
        </div>
      </div>

      <DealFormDialog open={editing} onOpenChange={setEditing} deal={deal} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this deal?"
        description="Its activities will be deleted too. This can't be undone."
        onConfirm={() =>
          remove.mutateAsync(undefined).then(() => {
            router.replace("/deals");
          })
        }
      />
      <LostReasonDialog
        dealTitle={askLostReason ? deal.title : null}
        onCancel={() => setAskLostReason(false)}
        onConfirm={(reason) => {
          setAskLostReason(false);
          if (lostStage) move.mutate({ stage_id: lostStage.id, lost_reason: reason });
        }}
      />
    </div>
  );
}

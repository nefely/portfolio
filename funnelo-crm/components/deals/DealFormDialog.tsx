"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, formText } from "@/components/crm/FormField";
import { OwnerField } from "@/components/crm/OwnerField";
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import { StageBadge } from "@/components/crm/StageBadge";
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { useStages } from "@/hooks/useTeam";
import { createDeal, updateDeal } from "@/lib/data/deals";
import { queryKeys } from "@/lib/query/keys";
import { companyOptionsList, contactOptionsList } from "@/lib/query/options";
import { type Errors, hasErrors, validateDeal } from "@/lib/validation";
import type { DealRow } from "@/types/crm";

export type DealDefaults = Partial<Pick<DealRow, "stage_id" | "company_id" | "contact_id">>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Є — редагування, немає — створення. */
  deal?: DealRow;
  defaults?: DealDefaults;
};

export function DealFormDialog({ open, onOpenChange, deal, defaults }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Вміст монтується лише відкритим — стан форми щоразу свіжий. */}
        {open && <DealForm deal={deal} defaults={defaults} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function DealForm({
  deal,
  defaults,
  onDone,
}: {
  deal?: DealRow;
  defaults?: DealDefaults;
  onDone: () => void;
}) {
  const me = useMe();
  const router = useRouter();
  const { data: stages = [] } = useStages();
  const { data: companies = [] } = useQuery(companyOptionsList());
  const { data: contacts = [] } = useQuery(contactOptionsList());

  const firstOpenStage = stages.find((stage) => stage.kind === "open")?.id ?? "";
  const [stageId, setStageId] = useState(deal?.stage_id ?? defaults?.stage_id ?? "");
  const [companyId, setCompanyId] = useState(deal?.company_id ?? defaults?.company_id ?? "");
  const [contactId, setContactId] = useState(deal?.contact_id ?? defaults?.contact_id ?? "");
  const [ownerId, setOwnerId] = useState(deal?.owner_id ?? me.user_id);
  const [errors, setErrors] = useState<Errors<"title" | "value">>({});

  const effectiveStageId = stageId || firstOpenStage;
  const stage = stages.find((item) => item.id === effectiveStageId);

  // Контакти — лише вибраної компанії (або всі, якщо компанію не вибрано).
  const contactChoices = companyId
    ? contacts.filter((contact) => contact.company_id === companyId)
    : contacts;

  const save = useCrmMutation({
    mutationFn: (db, input: Parameters<typeof createDeal>[1] & { lost_reason: string | null }) =>
      deal ? updateDeal(db, deal.id, input) : createDeal(db, input, Date.now()),
    entity: "deals",
    success: deal ? "Deal updated" : "Deal created",
    onSuccess: (saved, _input, queryClient) =>
      queryClient.setQueryData(queryKeys.deal(saved.id), saved),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = formText(form, "title");
    const value = formText(form, "value");
    const validation = validateDeal({ title, value });
    setErrors(validation);
    if (hasErrors(validation)) return;

    save.mutate(
      {
        title: title as string,
        value: value ? Number(value) : 0,
        stage_id: effectiveStageId,
        company_id: companyId || null,
        contact_id: contactId || null,
        owner_id: ownerId || null,
        expected_close_date: formText(form, "expected_close_date"),
        notes: formText(form, "notes"),
        lost_reason: stage?.kind === "lost" ? formText(form, "lost_reason") : null,
      },
      {
        onSuccess: (saved) => {
          onDone();
          if (!deal) router.push(`/deals/${saved.id}`);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{deal ? "Edit deal" : "New deal"}</DialogTitle>
        <DialogDescription>
          {deal ? "Update the deal details." : "Add an opportunity to the pipeline."}
        </DialogDescription>
      </DialogHeader>

      <FormField label="Title" htmlFor="title" error={errors.title} required>
        <Input
          id="title"
          name="title"
          defaultValue={deal?.title}
          placeholder="Acme · Annual license"
          autoFocus
          aria-invalid={Boolean(errors.title)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Value (USD)" htmlFor="value" error={errors.value}>
          <Input
            id="value"
            name="value"
            type="number"
            inputMode="decimal"
            min={0}
            step={100}
            defaultValue={deal?.value ?? ""}
            placeholder="25000"
            aria-invalid={Boolean(errors.value)}
          />
        </FormField>
        <FormField label="Stage" htmlFor="stage">
          <SimpleSelect
            id="stage"
            value={effectiveStageId}
            onChange={setStageId}
            placeholder="Select stage"
            options={stages.map((item) => ({ value: item.id, label: <StageBadge stage={item} /> }))}
          />
        </FormField>
      </div>

      {stage?.kind === "lost" && (
        <FormField label="Lost reason" htmlFor="lost_reason">
          <Input
            id="lost_reason"
            name="lost_reason"
            defaultValue={deal?.lost_reason ?? ""}
            placeholder="Chose a competitor"
          />
        </FormField>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company" htmlFor="company">
          <SimpleSelect
            id="company"
            value={companyId}
            onChange={(next) => {
              setCompanyId(next);
              // Контакт іншої компанії більше не підходить.
              if (contacts.find((contact) => contact.id === contactId)?.company_id !== next)
                setContactId("");
            }}
            placeholder="No company"
            options={[
              { value: "", label: "No company" },
              ...companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </FormField>
        <FormField label="Contact" htmlFor="contact">
          <SimpleSelect
            id="contact"
            value={contactId}
            onChange={setContactId}
            placeholder="No contact"
            options={[
              { value: "", label: "No contact" },
              ...contactChoices.map((c) => ({ value: c.id, label: c.full_name })),
            ]}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Expected close" htmlFor="expected_close_date">
          <Input
            id="expected_close_date"
            name="expected_close_date"
            type="date"
            defaultValue={deal?.expected_close_date ?? ""}
          />
        </FormField>
        <OwnerField value={ownerId} onChange={setOwnerId} />
      </div>

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={deal?.notes ?? ""}
          rows={3}
          maxLength={2000}
        />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending || !effectiveStageId}>
          {save.isPending ? "Saving…" : deal ? "Save changes" : "Create deal"}
        </Button>
      </DialogFooter>
    </form>
  );
}

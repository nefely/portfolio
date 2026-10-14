"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { type ActivityInput, createActivity } from "@/lib/data/activities";
import { boardOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { type Errors, hasErrors, validateActivity } from "@/lib/validation";
import { ACTIVITY_TYPES, type ActivityType } from "@/types/crm";
import { ACTIVITY_META } from "./activityMeta";

/** До чого прив'язати активність, якщо її створюють зі сторінки угоди/компанії/контакту. */
export type ActivityLink = Partial<Pick<ActivityInput, "deal_id" | "company_id" | "contact_id">>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: ActivityLink;
  defaultType?: ActivityType;
};

export function ActivityFormDialog({ open, onOpenChange, link, defaultType }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <ActivityForm link={link} defaultType={defaultType} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Значення для input[type=datetime-local]: локальний час без секунд і поясу. */
function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function defaultDue() {
  const due = new Date();
  due.setDate(due.getDate() + 1);
  due.setHours(10, 0, 0, 0);
  return toLocalInput(due);
}

function ActivityForm({
  link,
  defaultType = "task",
  onDone,
}: {
  link?: ActivityLink;
  defaultType?: ActivityType;
  onDone: () => void;
}) {
  const [type, setType] = useState<ActivityType>(defaultType);
  const [dealId, setDealId] = useState(link?.deal_id ?? "");
  const [errors, setErrors] = useState<Errors<"subject">>({});
  // Поточний час читаємо один раз при монтуванні, а не в кожному рендері.
  const [initialDue] = useState(defaultDue);
  // Вибір угоди лише тоді, коли активність не прив'язана до конкретного запису.
  const pickDeal = !link;
  const { data: openDeals = [] } = useQuery({ ...boardOptions(), enabled: pickDeal });

  const save = useCrmMutation({
    mutationFn: createActivity,
    entity: "activities",
    success: (_, input) => (input.type === "note" ? "Note added" : "Activity scheduled"),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = formText(form, "subject");
    const validation = validateActivity({ subject });
    setErrors(validation);
    if (hasErrors(validation)) return;

    const due = formText(form, "due_at");
    const deal = openDeals.find((item) => item.id === dealId);

    save.mutate(
      {
        type,
        subject: subject as string,
        body: formText(form, "body"),
        due_at: type === "note" || !due ? null : new Date(due).toISOString(),
        deal_id: link?.deal_id ?? (dealId || null),
        company_id: link?.company_id ?? deal?.company_id ?? null,
        contact_id: link?.contact_id ?? deal?.contact_id ?? null,
      },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{type === "note" ? "Add note" : "Log activity"}</DialogTitle>
        <DialogDescription>Plan the next step or record what happened.</DialogDescription>
      </DialogHeader>

      <div role="radiogroup" aria-label="Activity type" className="grid grid-cols-5 gap-1.5">
        {ACTIVITY_TYPES.map((item) => {
          const meta = ACTIVITY_META[item];
          const Icon = meta.icon;
          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={type === item}
              onClick={() => setType(item)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs font-medium transition-colors",
                type === item
                  ? "border-primary bg-primary/5 text-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {meta.label}
            </button>
          );
        })}
      </div>

      <FormField
        label={type === "note" ? "Title" : "Subject"}
        htmlFor="subject"
        error={errors.subject}
        required
      >
        <Input
          id="subject"
          name="subject"
          autoFocus
          placeholder={type === "note" ? "Budget confirmed for Q3" : "Follow up on proposal"}
          aria-invalid={Boolean(errors.subject)}
        />
      </FormField>

      {type !== "note" && (
        <FormField label="Due" htmlFor="due_at">
          <Input id="due_at" name="due_at" type="datetime-local" defaultValue={initialDue} />
        </FormField>
      )}

      {pickDeal && (
        <FormField
          label="Deal"
          htmlFor="deal"
          hint="Optional. Links the activity to the deal timeline."
        >
          <SimpleSelect
            id="deal"
            value={dealId}
            onChange={setDealId}
            placeholder="No deal"
            options={[
              { value: "", label: "No deal" },
              ...openDeals.map((d) => ({ value: d.id, label: d.title })),
            ]}
          />
        </FormField>
      )}

      <FormField label="Details" htmlFor="body">
        <Textarea id="body" name="body" rows={3} maxLength={4000} />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

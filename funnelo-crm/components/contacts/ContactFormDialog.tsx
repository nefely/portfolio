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
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { type ContactInput, createContact, updateContact } from "@/lib/data/contacts";
import { queryKeys } from "@/lib/query/keys";
import { companyOptionsList } from "@/lib/query/options";
import { type Errors, hasErrors, validateContact } from "@/lib/validation";
import type { Contact } from "@/types/crm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact;
  defaultCompanyId?: string;
};

export function ContactFormDialog({ open, onOpenChange, contact, defaultCompanyId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <ContactForm
            contact={contact}
            defaultCompanyId={defaultCompanyId}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({
  contact,
  defaultCompanyId,
  onDone,
}: {
  contact?: Contact;
  defaultCompanyId?: string;
  onDone: () => void;
}) {
  const me = useMe();
  const router = useRouter();
  const { data: companies = [] } = useQuery(companyOptionsList());
  const [companyId, setCompanyId] = useState(contact?.company_id ?? defaultCompanyId ?? "");
  const [ownerId, setOwnerId] = useState(contact?.owner_id ?? me.user_id);
  const [errors, setErrors] = useState<Errors<"first_name" | "email">>({});

  const save = useCrmMutation({
    mutationFn: (db, input: ContactInput) =>
      contact ? updateContact(db, contact.id, input) : createContact(db, input),
    entity: "contacts",
    success: contact ? "Contact updated" : "Contact created",
    onSuccess: (saved, _input, queryClient) =>
      queryClient.setQueryData(queryKeys.contact(saved.id), saved),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = formText(form, "first_name");
    const email = formText(form, "email")?.toLowerCase() ?? null;
    const validation = validateContact({ first_name: firstName, email });
    setErrors(validation);
    if (hasErrors(validation)) return;

    save.mutate(
      {
        first_name: firstName as string,
        last_name: formText(form, "last_name"),
        email,
        phone: formText(form, "phone"),
        job_title: formText(form, "job_title"),
        company_id: companyId || null,
        notes: formText(form, "notes"),
        owner_id: ownerId || null,
      },
      {
        onSuccess: (saved) => {
          onDone();
          // З картки компанії лишаємось на ній — новий контакт з'явиться у списку.
          if (!contact && !defaultCompanyId) router.push(`/contacts/${saved.id}`);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{contact ? "Edit contact" : "New contact"}</DialogTitle>
        <DialogDescription>People you talk to at your accounts.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="first_name" error={errors.first_name} required>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={contact?.first_name}
            autoFocus
            aria-invalid={Boolean(errors.first_name)}
          />
        </FormField>
        <FormField label="Last name" htmlFor="last_name">
          <Input id="last_name" name="last_name" defaultValue={contact?.last_name ?? ""} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
            aria-invalid={Boolean(errors.email)}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={contact?.phone ?? ""} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor="job_title">
          <Input id="job_title" name="job_title" defaultValue={contact?.job_title ?? ""} />
        </FormField>
        <FormField label="Company" htmlFor="company">
          <SimpleSelect
            id="company"
            value={companyId}
            onChange={setCompanyId}
            placeholder="No company"
            options={[
              { value: "", label: "No company" },
              ...companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </FormField>
      </div>

      <OwnerField value={ownerId} onChange={setOwnerId} />

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={contact?.notes ?? ""}
          rows={3}
          maxLength={2000}
        />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : contact ? "Save changes" : "Create contact"}
        </Button>
      </DialogFooter>
    </form>
  );
}

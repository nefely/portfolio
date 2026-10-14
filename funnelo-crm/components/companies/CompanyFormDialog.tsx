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
import { type CompanyInput, createCompany, updateCompany } from "@/lib/data/companies";
import { queryKeys } from "@/lib/query/keys";
import { industriesOptions } from "@/lib/query/options";
import { type Errors, hasErrors, normalizeDomain, validateCompany } from "@/lib/validation";
import { COMPANY_SIZES, type Company, type CompanyListRow, type CompanySize } from "@/types/crm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
};

export function CompanyFormDialog({ open, onOpenChange, company }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <CompanyForm company={company} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({ company, onDone }: { company?: Company; onDone: () => void }) {
  const me = useMe();
  const router = useRouter();
  const { data: industries = [] } = useQuery(industriesOptions());
  const [size, setSize] = useState<string>(company?.size ?? "");
  const [ownerId, setOwnerId] = useState(company?.owner_id ?? me.user_id);
  const [errors, setErrors] = useState<Errors<"name" | "domain">>({});

  const save = useCrmMutation({
    mutationFn: (db, input: CompanyInput) =>
      company ? updateCompany(db, company.id, input) : createCompany(db, input),
    entity: "companies",
    success: company ? "Company updated" : "Company created",
    onSuccess: (saved, _input, queryClient) =>
      queryClient.setQueryData<CompanyListRow>(queryKeys.company(saved.id), (old) =>
        old ? { ...old, ...saved } : old,
      ),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = formText(form, "name");
    const domain = normalizeDomain(formText(form, "domain"));
    const validation = validateCompany({ name, domain });
    setErrors(validation);
    if (hasErrors(validation)) return;

    save.mutate(
      {
        name: name as string,
        domain,
        industry: formText(form, "industry"),
        size: (size || null) as CompanySize | null,
        country: formText(form, "country"),
        city: formText(form, "city"),
        phone: formText(form, "phone"),
        notes: formText(form, "notes"),
        owner_id: ownerId || null,
      },
      {
        onSuccess: (saved) => {
          onDone();
          if (!company) router.push(`/companies/${saved.id}`);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{company ? "Edit company" : "New company"}</DialogTitle>
        <DialogDescription>Accounts group contacts and deals together.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" error={errors.name} required>
          <Input
            id="name"
            name="name"
            defaultValue={company?.name}
            autoFocus
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>
        <FormField label="Domain" htmlFor="domain" error={errors.domain}>
          <Input
            id="domain"
            name="domain"
            defaultValue={company?.domain ?? ""}
            placeholder="acme.com"
            aria-invalid={Boolean(errors.domain)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Industry" htmlFor="industry">
          <Input
            id="industry"
            name="industry"
            list="industry-options"
            defaultValue={company?.industry ?? ""}
            placeholder="Software"
          />
          <datalist id="industry-options">
            {industries.map((industry) => (
              <option key={industry} value={industry} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Size" htmlFor="size">
          <SimpleSelect
            id="size"
            value={size}
            onChange={setSize}
            placeholder="Employees"
            options={[
              { value: "", label: "Unknown" },
              ...COMPANY_SIZES.map((item) => ({ value: item, label: `${item} employees` })),
            ]}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Country" htmlFor="country">
          <Input id="country" name="country" defaultValue={company?.country ?? ""} />
        </FormField>
        <FormField label="City" htmlFor="city">
          <Input id="city" name="city" defaultValue={company?.city ?? ""} />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={company?.phone ?? ""} />
        </FormField>
      </div>

      <OwnerField value={ownerId} onChange={setOwnerId} />

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={company?.notes ?? ""}
          rows={3}
          maxLength={2000}
        />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : company ? "Save changes" : "Create company"}
        </Button>
      </DialogFooter>
    </form>
  );
}

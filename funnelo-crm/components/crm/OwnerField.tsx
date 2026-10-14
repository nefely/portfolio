"use client";

import { useMe } from "@/components/providers/MeProvider";
import { useTeam } from "@/hooks/useTeam";
import { isAdmin } from "@/lib/permissions";
import { FormField } from "./FormField";
import { PersonAvatar, PersonLabel } from "./PersonAvatar";
import { SimpleSelect } from "./SimpleSelect";

/**
 * Власник запису. Admin може призначити будь-кого з активних учасників;
 * звичайний користувач створює записи лише на себе (так само обмежує RLS),
 * тож бачить своє ім'я без вибору.
 */
export function OwnerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const me = useMe();
  const { data: team = [] } = useTeam();

  if (!isAdmin(me)) {
    const owner = team.find((member) => member.user_id === value) ?? me;
    return (
      <FormField label="Owner" htmlFor="owner">
        <div
          id="owner"
          className="flex h-8 items-center rounded-lg border border-dashed px-2.5 text-sm"
        >
          <PersonLabel person={owner} size="xs" />
        </div>
      </FormField>
    );
  }

  const options = team
    .filter((member) => member.is_active || member.user_id === value)
    .map((member) => ({
      value: member.user_id,
      label: (
        <span className="flex items-center gap-2">
          <PersonAvatar person={member} size="xs" />
          {member.full_name}
        </span>
      ),
    }));

  return (
    <FormField label="Owner" htmlFor="owner">
      <SimpleSelect
        id="owner"
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Unassigned"
      />
    </FormField>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { ACCOUNT_ROLES } from "@/lib/auth/roles";
import type { AccountRole } from "@/types/account";

interface RolePickerProps {
  value: AccountRole | null;
  onChange: (role: AccountRole) => void;
}

// Нативні radio (name="role") під великими картками: працює з клавіатурою
// (стрілки), читається скрінрідером як група, і значення саме потрапляє у
// FormData server action'а.
export function RolePicker({ value, onChange }: RolePickerProps) {
  const t = useTranslations("auth");

  const copy: Record<AccountRole, { title: string; text: string }> = {
    seeker: { title: t("roleSeekerTitle"), text: t("roleSeekerText") },
    employer: { title: t("roleEmployerTitle"), text: t("roleEmployerText") },
  };

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t("roleLegend")}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACCOUNT_ROLES.map((role) => {
          const isActive = value === role;
          return (
            <label
              key={role}
              className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-gray-400 ${
                isActive
                  ? "border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-900"
                  : "border-gray-200 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role}
                checked={isActive}
                onChange={() => onChange(role)}
                className="sr-only"
              />
              <span className="font-semibold">{copy[role].title}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{copy[role].text}</span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t("roleFixedHint")}</p>
    </fieldset>
  );
}

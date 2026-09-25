"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { chooseRole, type AuthFormState } from "@/lib/auth/actions";
import { errorBannerClassName, primaryButtonClassName } from "@/components/shared/formStyles";
import type { AccountRole } from "@/types/account";
import { RolePicker } from "./RolePicker";

export function ChooseRoleForm() {
  const t = useTranslations("auth");
  const [role, setRole] = useState<AccountRole | null>(null);
  const [state, action, pending] = useActionState<AuthFormState, FormData>(chooseRole, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <RolePicker value={role} onChange={setRole} />

      {state.formError && (
        <p role="alert" className={errorBannerClassName}>
          {t(`errors.${state.formError}`)}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !role}
        className={`${primaryButtonClassName} mt-2`}
      >
        {t("chooseRoleSubmit")}
      </button>
    </form>
  );
}

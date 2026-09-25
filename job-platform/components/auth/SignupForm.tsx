"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { signUp, type AuthFormState } from "@/lib/auth/actions";
import { GOOGLE_AUTH_ENABLED } from "@/lib/auth/features";
import { FormField, fieldDescribedBy } from "@/components/shared/FormField";
import {
  errorBannerClassName,
  inputClassName,
  primaryButtonClassName,
  successBannerClassName,
} from "@/components/shared/formStyles";
import type { AccountRole } from "@/types/account";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { RolePicker } from "./RolePicker";

interface SignupFormProps {
  /** З ?role= — CTA на Головній ведуть одразу з обраною роллю. */
  initialRole: AccountRole | null;
}

export function SignupForm({ initialRole }: SignupFormProps) {
  const t = useTranslations("auth");
  const [role, setRole] = useState<AccountRole | null>(initialRole);
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUp, {});

  if (state.checkEmailFor) {
    return (
      <div role="status" className={successBannerClassName}>
        <p className="font-semibold">{t("checkEmailTitle")}</p>
        <p className="mt-1">{t("checkEmailText", { email: state.checkEmailFor })}</p>
      </div>
    );
  }

  const emailError = state.errors?.email && t(`errors.${state.errors.email}`);
  const passwordError = state.errors?.password && t(`errors.${state.errors.password}`);

  return (
    <div className="flex flex-col gap-6">
      <form action={action} noValidate className="flex flex-col gap-4">
        <RolePicker value={role} onChange={setRole} />

        <FormField id="signup-email" label={t("emailLabel")} error={emailError}>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            placeholder={t("emailPlaceholder")}
            aria-invalid={emailError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("signup-email", emailError)}
            className={inputClassName}
          />
        </FormField>

        <FormField
          id="signup-password"
          label={t("passwordLabel")}
          hint={t("passwordHint")}
          error={passwordError}
        >
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={passwordError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("signup-password", passwordError, t("passwordHint"))}
            className={inputClassName}
          />
        </FormField>

        {state.formError && (
          <p role="alert" className={errorBannerClassName}>
            {t(`errors.${state.formError}`)}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${primaryButtonClassName} mt-2`}>
          {pending ? t("signupSubmitting") : t("signupSubmit")}
        </button>
      </form>

      {/* Google-реєстрація теж має знати роль — без неї кнопка лише
          підкаже обрати роль вище, а не створить акаунт "без ролі". */}
      {GOOGLE_AUTH_ENABLED && (
        <>
          <OrDivider label={t("orDivider")} />
          {role ? (
            <GoogleButton role={role} />
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t("errors.roleRequired")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

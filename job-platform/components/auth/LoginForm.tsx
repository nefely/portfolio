"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, type AuthFormState } from "@/lib/auth/actions";
import { GOOGLE_AUTH_ENABLED } from "@/lib/auth/features";
import type { AuthErrorKey } from "@/lib/validation/auth";
import { FormField, fieldDescribedBy } from "@/components/shared/FormField";
import {
  errorBannerClassName,
  inputClassName,
  primaryButtonClassName,
} from "@/components/shared/formStyles";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";

interface LoginFormProps {
  next?: string;
  /** Помилка з ?error= (напр. невдалий callback від Google). */
  initialError?: AuthErrorKey;
}

export function LoginForm({ next, initialError }: LoginFormProps) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signIn, {
    formError: initialError,
  });

  const emailError = state.errors?.email && t(`errors.${state.errors.email}`);
  const passwordError = state.errors?.password && t(`errors.${state.errors.password}`);

  return (
    <div className="flex flex-col gap-6">
      <form action={action} noValidate className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}

        <FormField id="login-email" label={t("emailLabel")} error={emailError}>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            placeholder={t("emailPlaceholder")}
            aria-invalid={emailError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("login-email", emailError)}
            className={inputClassName}
          />
        </FormField>

        <FormField id="login-password" label={t("passwordLabel")} error={passwordError}>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={passwordError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("login-password", passwordError)}
            className={inputClassName}
          />
        </FormField>

        {state.formError && (
          <p role="alert" className={errorBannerClassName}>
            {t(`errors.${state.formError}`)}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${primaryButtonClassName} mt-2`}>
          {pending ? t("loginSubmitting") : t("loginSubmit")}
        </button>
      </form>

      {GOOGLE_AUTH_ENABLED && (
        <>
          <OrDivider label={t("orDivider")} />
          <GoogleButton next={next} />
        </>
      )}
    </div>
  );
}

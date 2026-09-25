"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { LOCATION_CODES } from "@/data/locations";
import { saveEmployerProfile } from "@/lib/account/actions";
import {
  EMPLOYER_ABOUT_MAX_LENGTH,
  validateEmployerProfile,
  type EmployerProfileErrors,
  type EmployerProfileValues,
} from "@/lib/validation/employerProfile";
import { FormField, fieldDescribedBy } from "@/components/shared/FormField";
import { Select } from "@/components/shared/Select";
import { inputClassName } from "@/components/shared/formStyles";
import { useRouter } from "@/i18n/navigation";
import type { AccountFormError } from "@/types/account";
import { SaveBar } from "./SaveBar";

interface EmployerProfileFormProps {
  initialValues: EmployerProfileValues;
  hasProfile: boolean;
}

export function EmployerProfileForm({ initialValues, hasProfile }: EmployerProfileFormProps) {
  const t = useTranslations("account");
  const tLocations = useTranslations("locations");

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<EmployerProfileErrors>({});
  const [formError, setFormError] = useState<AccountFormError>();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof EmployerProfileValues>(key: K, value: EmployerProfileValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function errorText(key: keyof EmployerProfileValues) {
    const error = errors[key];
    return error ? t(`errors.${error}`) : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateEmployerProfile(values);
    setErrors(validationErrors);
    setFormError(undefined);
    if (Object.values(validationErrors).some(Boolean)) return;

    startTransition(async () => {
      const result = await saveEmployerProfile(values);
      if (result.ok) {
        setSaved(true);
        // Перше збереження створює компанію — блок "Мої вакансії" на цій
        // сторінці (Server Component) має перемкнутися з підказки на список.
        if (!hasProfile) router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setFormError(result.formError);
      }
    });
  }

  const nameError = errorText("name");
  const websiteError = errorText("website");
  const aboutError = errorText("about");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {!hasProfile && !saved && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noProfileYet")}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="ep-name" label={t("companyNameLabel")} error={nameError}>
          <input
            id="ep-name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="organization"
            aria-invalid={nameError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("ep-name", nameError)}
            className={inputClassName}
          />
        </FormField>
        <Select
          showLabel
          label={t("locationLabel")}
          value={values.locationCode}
          onChange={(code) => update("locationCode", code)}
          options={LOCATION_CODES.map((code) => ({ value: code, label: tLocations(code) }))}
        />
      </div>

      <FormField
        id="ep-website"
        label={t("websiteLabel")}
        labelHint={t("optional")}
        error={websiteError}
      >
        <input
          id="ep-website"
          type="url"
          value={values.website}
          onChange={(e) => update("website", e.target.value)}
          placeholder={t("websitePlaceholder")}
          aria-invalid={websiteError ? "true" : undefined}
          aria-describedby={fieldDescribedBy("ep-website", websiteError)}
          className={inputClassName}
        />
      </FormField>

      <FormField
        id="ep-about"
        label={t("companyAboutLabel")}
        labelHint={t("optional")}
        error={aboutError}
      >
        <textarea
          id="ep-about"
          rows={5}
          maxLength={EMPLOYER_ABOUT_MAX_LENGTH}
          value={values.about}
          onChange={(e) => update("about", e.target.value)}
          aria-invalid={aboutError ? "true" : undefined}
          aria-describedby={fieldDescribedBy("ep-about", aboutError)}
          className={inputClassName}
        />
      </FormField>

      <SaveBar pending={pending} saved={saved} formError={formError} />
    </form>
  );
}

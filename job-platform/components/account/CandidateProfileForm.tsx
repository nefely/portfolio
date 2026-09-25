"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CATEGORY_IDS } from "@/data/categories";
import { CATEGORY_COLORS } from "@/data/categoryColors";
import { EMPLOYMENT_TYPE_IDS } from "@/data/employmentTypes";
import { EXPERIENCE_LEVEL_IDS } from "@/data/experienceLevels";
import { LOCATION_CODES } from "@/data/locations";
import { WORK_FORMAT_IDS } from "@/data/workFormats";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { saveCandidateProfile } from "@/lib/account/actions";
import {
  ABOUT_MAX_LENGTH,
  CURRENCIES,
  validateCandidateProfile,
  type CandidateProfileErrors,
  type CandidateProfileValues,
} from "@/lib/validation/candidateProfile";
import { FilterChipGroup } from "@/components/shared/FilterChipGroup";
import { FormField, fieldDescribedBy } from "@/components/shared/FormField";
import { Select } from "@/components/shared/Select";
import { inputClassName } from "@/components/shared/formStyles";
import type { AccountFormError } from "@/types/account";
import { LanguagesField } from "./LanguagesField";
import { SaveBar } from "./SaveBar";

interface CandidateProfileFormProps {
  initialValues: CandidateProfileValues;
  /** null — профілю ще немає, з'явиться після першого збереження. */
  initialSlug: string | null;
}

export function CandidateProfileForm({ initialValues, initialSlug }: CandidateProfileFormProps) {
  const t = useTranslations("account");
  const tCategories = useTranslations("categories");
  const tLocations = useTranslations("locations");
  const tEmployment = useTranslations("employmentType");
  const tWorkFormat = useTranslations("workFormat");
  const tExperience = useTranslations("experienceLevel");
  const tLanguages = useTranslations("languages");

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CandidateProfileErrors>({});
  const [formError, setFormError] = useState<AccountFormError>();
  const [slug, setSlug] = useState(initialSlug);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof CandidateProfileValues>(
    key: K,
    value: CandidateProfileValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function errorText(key: keyof CandidateProfileValues) {
    const error = errors[key];
    return error ? t(`errors.${error}`) : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateCandidateProfile(values);
    setErrors(validationErrors);
    setFormError(undefined);
    if (Object.values(validationErrors).some(Boolean)) return;

    startTransition(async () => {
      const result = await saveCandidateProfile(values);
      if (result.ok) {
        setSlug(result.slug);
        setSaved(true);
      } else {
        setErrors(result.errors ?? {});
        setFormError(result.formError);
      }
    });
  }

  const nameError = errorText("name");
  const headlineError = errorText("headline");
  const salaryError = errorText("salaryExpectationFrom");
  const dateError = errorText("availableFrom");
  const aboutError = errorText("about");
  const skillsError = errorText("skills");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {slug ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Link href={`/candidates/${slug}`} className="font-semibold underline underline-offset-4">
            {t("viewPublicProfile")} →
          </Link>
          {!values.isPublic && (
            <span className="text-gray-500 dark:text-gray-400">{t("profileHidden")}</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noProfileYet")}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="cp-name" label={t("nameLabel")} error={nameError}>
          <input
            id="cp-name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            aria-invalid={nameError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("cp-name", nameError)}
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

      <FormField id="cp-headline" label={t("headlineLabel")} error={headlineError}>
        <input
          id="cp-headline"
          value={values.headline}
          onChange={(e) => update("headline", e.target.value)}
          placeholder={t("headlinePlaceholder")}
          aria-invalid={headlineError ? "true" : undefined}
          aria-describedby={fieldDescribedBy("cp-headline", headlineError)}
          className={inputClassName}
        />
      </FormField>

      <div>
        <FilterChipGroup
          legend={t("categoriesLabel")}
          options={CATEGORY_IDS.map((id) => ({
            value: id,
            label: tCategories(id),
            colorClassName: CATEGORY_COLORS[id],
          }))}
          selected={values.categories}
          onChange={(next) => update("categories", next)}
        />
        {errors.categories && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorText("categories")}</p>
        )}
      </div>

      <FilterChipGroup
        legend={t("employmentTypesLabel")}
        options={EMPLOYMENT_TYPE_IDS.map((id) => ({ value: id, label: tEmployment(id) }))}
        selected={values.desiredEmploymentTypes}
        onChange={(next) => update("desiredEmploymentTypes", next)}
      />

      <FilterChipGroup
        legend={t("workFormatsLabel")}
        options={WORK_FORMAT_IDS.map((id) => ({ value: id, label: tWorkFormat(id) }))}
        selected={values.desiredWorkFormats}
        onChange={(next) => update("desiredWorkFormats", next)}
      />

      <Select
        showLabel
        label={t("experienceLabel")}
        value={values.experienceLevel}
        onChange={(level) => update("experienceLevel", level)}
        options={EXPERIENCE_LEVEL_IDS.map((id) => ({ value: id, label: tExperience(id) }))}
        className="sm:max-w-xs"
      />

      <LanguagesField
        value={values.languages}
        onChange={(next) => update("languages", next)}
        error={errorText("languages")}
      />

      <FormField
        id="cp-skills"
        label={t("skillsLabel")}
        labelHint={t("optional")}
        hint={t("skillsHint")}
        error={skillsError}
      >
        <input
          id="cp-skills"
          value={values.skills}
          onChange={(e) => update("skills", e.target.value)}
          aria-invalid={skillsError ? "true" : undefined}
          aria-describedby={fieldDescribedBy("cp-skills", skillsError, t("skillsHint"))}
          className={inputClassName}
        />
      </FormField>

      <FormField id="cp-about" label={t("aboutLabel")} labelHint={t("optional")} error={aboutError}>
        <textarea
          id="cp-about"
          rows={5}
          maxLength={ABOUT_MAX_LENGTH}
          value={values.about}
          onChange={(e) => update("about", e.target.value)}
          aria-invalid={aboutError ? "true" : undefined}
          aria-describedby={fieldDescribedBy("cp-about", aboutError)}
          className={inputClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id="cp-salary"
          label={t("salaryLabel")}
          labelHint={t("optional")}
          error={salaryError}
        >
          <input
            id="cp-salary"
            inputMode="numeric"
            value={values.salaryExpectationFrom}
            onChange={(e) => update("salaryExpectationFrom", e.target.value)}
            aria-invalid={salaryError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("cp-salary", salaryError)}
            className={inputClassName}
          />
        </FormField>
        <Select
          showLabel
          label={t("currencyLabel")}
          value={values.currency}
          onChange={(currency) => update("currency", currency)}
          options={CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
        />
        <FormField
          id="cp-available"
          label={t("availableFromLabel")}
          labelHint={t("optional")}
          error={dateError}
        >
          <input
            id="cp-available"
            type="date"
            value={values.availableFrom}
            onChange={(e) => update("availableFrom", e.target.value)}
            aria-invalid={dateError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("cp-available", dateError)}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-1 sm:max-w-xs">
        <Select
          showLabel
          label={t("profileLocaleLabel")}
          value={values.profileLocale}
          onChange={(locale) => update("profileLocale", locale)}
          options={routing.locales.map((locale) => ({ value: locale, label: tLanguages(locale) }))}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t("profileLocaleHint")}</p>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={values.isPublic}
          onChange={(e) => update("isPublic", e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-gray-900 dark:accent-gray-100"
        />
        <span className="text-sm">
          <span className="font-medium">{t("isPublicLabel")}</span>
          <span className="block text-gray-500 dark:text-gray-400">{t("isPublicHint")}</span>
        </span>
      </label>

      <SaveBar pending={pending} saved={saved} formError={formError} />
    </form>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CATEGORY_IDS } from "@/data/categories";
import { EMPLOYMENT_TYPE_IDS } from "@/data/employmentTypes";
import { EXPERIENCE_LEVEL_IDS } from "@/data/experienceLevels";
import { LANGUAGE_CODES } from "@/data/languages";
import { LOCATION_CODES } from "@/data/locations";
import { WORK_FORMAT_IDS } from "@/data/workFormats";
import { Link, useRouter } from "@/i18n/navigation";
import { createJob, updateJob } from "@/lib/account/jobActions";
import { CURRENCIES } from "@/lib/validation/candidateProfile";
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  validateJobPosting,
  type JobPostingErrors,
  type JobPostingValues,
} from "@/lib/validation/jobPosting";
import { FilterChipGroup } from "@/components/shared/FilterChipGroup";
import { FormField, fieldDescribedBy } from "@/components/shared/FormField";
import { Select } from "@/components/shared/Select";
import { inputClassName } from "@/components/shared/formStyles";
import type { AccountFormError } from "@/types/account";
import { SaveBar } from "./SaveBar";

interface JobPostingFormProps {
  initialValues: JobPostingValues;
  /** Є — редагування існуючої вакансії, немає — публікація нової. */
  jobId?: string;
}

export function JobPostingForm({ initialValues, jobId }: JobPostingFormProps) {
  const t = useTranslations("account");
  const tCategories = useTranslations("categories");
  const tLocations = useTranslations("locations");
  const tEmployment = useTranslations("employmentType");
  const tWorkFormat = useTranslations("workFormat");
  const tExperience = useTranslations("experienceLevel");
  const tLanguages = useTranslations("languages");
  const router = useRouter();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<JobPostingErrors>({});
  const [formError, setFormError] = useState<AccountFormError>();
  const [pending, startTransition] = useTransition();

  function update<K extends keyof JobPostingValues>(key: K, value: JobPostingValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function errorText(key: keyof JobPostingValues) {
    const error = errors[key];
    return error ? t(`errors.${error}`) : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateJobPosting(values);
    setErrors(validationErrors);
    setFormError(undefined);
    if (Object.values(validationErrors).some(Boolean)) return;

    startTransition(async () => {
      const result = jobId ? await updateJob(jobId, values) : await createJob(values);
      if (result.ok) {
        // Назад у кабінет: список "Мої вакансії" там — Server Component,
        // refresh підтягує щойно збережену вакансію.
        router.push("/account");
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setFormError(result.formError);
      }
    });
  }

  const titleError = errorText("title");
  const descriptionError = errorText("description");
  const salaryFromError = errorText("salaryFrom");
  const salaryToError = errorText("salaryTo");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FormField id="job-title" label={t("jobTitleLabel")} error={titleError}>
        <input
          id="job-title"
          value={values.title}
          maxLength={JOB_TITLE_MAX_LENGTH}
          onChange={(e) => update("title", e.target.value)}
          placeholder={t("jobTitlePlaceholder")}
          aria-invalid={titleError ? "true" : undefined}
          aria-describedby={fieldDescribedBy("job-title", titleError)}
          className={inputClassName}
        />
      </FormField>

      <FormField
        id="job-description"
        label={t("jobDescriptionLabel")}
        hint={t("jobLanguageHint")}
        error={descriptionError}
      >
        <textarea
          id="job-description"
          rows={7}
          maxLength={JOB_DESCRIPTION_MAX_LENGTH}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          aria-invalid={descriptionError ? "true" : undefined}
          aria-describedby={fieldDescribedBy(
            "job-description",
            descriptionError,
            t("jobLanguageHint"),
          )}
          className={inputClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          showLabel
          label={t("jobCategoryLabel")}
          value={values.category}
          onChange={(category) => update("category", category)}
          options={CATEGORY_IDS.map((id) => ({ value: id, label: tCategories(id) }))}
        />
        <Select
          showLabel
          label={t("locationLabel")}
          value={values.locationCode}
          onChange={(code) => update("locationCode", code)}
          options={LOCATION_CODES.map((code) => ({ value: code, label: tLocations(code) }))}
        />
        <Select
          showLabel
          label={t("jobEmploymentTypeLabel")}
          value={values.employmentType}
          onChange={(type) => update("employmentType", type)}
          options={EMPLOYMENT_TYPE_IDS.map((id) => ({ value: id, label: tEmployment(id) }))}
        />
        <Select
          showLabel
          label={t("jobWorkFormatLabel")}
          value={values.workFormat}
          onChange={(format) => update("workFormat", format)}
          options={WORK_FORMAT_IDS.map((id) => ({ value: id, label: tWorkFormat(id) }))}
        />
        <Select
          showLabel
          label={t("jobExperienceLabel")}
          value={values.experienceLevel}
          onChange={(level) => update("experienceLevel", level)}
          options={EXPERIENCE_LEVEL_IDS.map((id) => ({ value: id, label: tExperience(id) }))}
        />
      </div>

      <FilterChipGroup
        legend={t("jobLanguagesLabel")}
        options={LANGUAGE_CODES.map((code) => ({ value: code, label: tLanguages(code) }))}
        selected={values.requiredLanguages}
        onChange={(next) => update("requiredLanguages", next)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id="job-salary-from"
          label={t("jobSalaryFromLabel")}
          labelHint={t("optional")}
          error={salaryFromError}
        >
          <input
            id="job-salary-from"
            inputMode="numeric"
            value={values.salaryFrom}
            onChange={(e) => update("salaryFrom", e.target.value)}
            aria-invalid={salaryFromError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("job-salary-from", salaryFromError)}
            className={inputClassName}
          />
        </FormField>
        <FormField
          id="job-salary-to"
          label={t("jobSalaryToLabel")}
          labelHint={t("optional")}
          error={salaryToError}
        >
          <input
            id="job-salary-to"
            inputMode="numeric"
            value={values.salaryTo}
            onChange={(e) => update("salaryTo", e.target.value)}
            aria-invalid={salaryToError ? "true" : undefined}
            aria-describedby={fieldDescribedBy("job-salary-to", salaryToError)}
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
      </div>

      <SaveBar
        pending={pending}
        saved={false}
        formError={formError}
        submitLabel={jobId ? t("save") : t("publishJob")}
        pendingLabel={jobId ? t("saving") : t("publishingJob")}
      >
        <Link href="/account" className="text-sm font-medium underline underline-offset-4">
          {t("cancel")}
        </Link>
      </SaveBar>
    </form>
  );
}

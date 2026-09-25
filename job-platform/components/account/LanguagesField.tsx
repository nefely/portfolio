"use client";

import { useTranslations } from "next-intl";
import { LANGUAGE_CODES } from "@/data/languages";
import { LANGUAGE_LEVELS } from "@/data/languageLevels";
import { Select } from "@/components/shared/Select";
import type { CandidateLanguage } from "@/types/candidate";
import type { LanguageCode } from "@/types/language";

interface LanguagesFieldProps {
  value: CandidateLanguage[];
  onChange: (next: CandidateLanguage[]) => void;
  error?: string;
}

// Рядок = мова + рівень (формат job_platform_candidates.languages). Кожну мову
// можна обрати лише раз — у списку рядка лишаються лише ще не зайняті.
export function LanguagesField({ value, onChange, error }: LanguagesFieldProps) {
  const t = useTranslations("account");
  const tLanguages = useTranslations("languages");
  const tLevels = useTranslations("languageLevels");

  const usedCodes = value.map((language) => language.code);
  const freeCodes = LANGUAGE_CODES.filter((code) => !usedCodes.includes(code));

  function updateRow(index: number, patch: Partial<CandidateLanguage>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t("languagesLabel")}</legend>
      <div className="flex flex-col gap-3">
        {value.map((row, index) => {
          const codeOptions = LANGUAGE_CODES.filter(
            (code) => code === row.code || !usedCodes.includes(code),
          ).map((code) => ({ value: code, label: tLanguages(code) }));

          return (
            // key за індексом, а не за кодом: зміна мови в рядку не має
            // перемонтовувати рядок (інакше select втрачає фокус).
            <div key={index} className="flex flex-wrap items-end gap-2">
              <Select
                label={t("languageLabel")}
                value={row.code}
                onChange={(code: LanguageCode) => updateRow(index, { code })}
                options={codeOptions}
                className="min-w-36 flex-1"
              />
              <Select
                label={t("levelLabel")}
                value={row.level}
                onChange={(level) => updateRow(index, { level })}
                options={LANGUAGE_LEVELS.map((level) => ({ value: level, label: tLevels(level) }))}
                className="min-w-36 flex-1"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="h-10.5 rounded-lg border border-gray-300 px-3 text-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900"
              >
                {t("removeLanguage")}
              </button>
            </div>
          );
        })}

        {freeCodes.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([...value, { code: freeCodes[0], level: "intermediate" }])}
            className="self-start text-sm font-semibold underline underline-offset-4"
          >
            + {t("addLanguage")}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </fieldset>
  );
}

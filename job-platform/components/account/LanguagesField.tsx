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
            // Завжди один рядок: селекти ділять ширину (min-w-0 — щоб могли
            // стискатися вужче за текст), квадратна кнопка — фіксована.
            <div key={index} className="flex items-end gap-2">
              <Select
                label={t("languageLabel")}
                value={row.code}
                onChange={(code: LanguageCode) => updateRow(index, { code })}
                options={codeOptions}
                className="min-w-0 flex-1"
              />
              <Select
                label={t("levelLabel")}
                value={row.level}
                onChange={(level) => updateRow(index, { level })}
                options={LANGUAGE_LEVELS.map((level) => ({ value: level, label: tLevels(level) }))}
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={`${t("removeLanguage")}: ${tLanguages(row.code)}`}
                title={t("removeLanguage")}
                // Той самий вигляд, що й кнопка фільтрів (FiltersPanel).
                className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-900 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-100 dark:hover:bg-red-900/60"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4.5 w-4.5"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
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

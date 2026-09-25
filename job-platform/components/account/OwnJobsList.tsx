"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CATEGORY_COLORS } from "@/data/categoryColors";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteJob } from "@/lib/account/jobActions";
import type { OwnJobSummary } from "@/lib/account/queries";
import { pickLocalized } from "@/lib/i18n/pickLocalized";
import { errorBannerClassName } from "@/components/shared/formStyles";
import type { AppLocale } from "@/types/i18n";

interface OwnJobsListProps {
  jobs: OwnJobSummary[];
}

export function OwnJobsList({ jobs }: OwnJobsListProps) {
  const t = useTranslations("account");
  const tCategories = useTranslations("categories");
  const tLocations = useTranslations("locations");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  function handleDelete(id: string) {
    if (!window.confirm(t("deleteJobConfirm"))) return;

    setDeletingId(id);
    setFailed(false);
    startTransition(async () => {
      const result = await deleteJob(id);
      if (result.ok) {
        router.refresh();
      } else {
        setFailed(true);
      }
      setDeletingId(null);
    });
  }

  if (jobs.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("noJobsYet")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {failed && (
        <p role="alert" className={errorBannerClassName}>
          {t("errors.saveFailed")}
        </p>
      )}
      <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {jobs.map((job) => (
          <li
            key={job.id}
            className={`flex flex-wrap items-center justify-between gap-3 py-3 ${
              deletingId === job.id ? "opacity-50" : ""
            }`}
          >
            <div className="min-w-0">
              <Link href={`/jobs/${job.id}`} className="font-semibold hover:underline">
                {pickLocalized(job.title, locale)}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${CATEGORY_COLORS[job.category]}`}
                >
                  {tCategories(job.category)}
                </span>
                <span>{tLocations(job.locationCode)}</span>
                <span>·</span>
                <span>{t("postedOn", { date: dateFormat.format(new Date(job.postedAt)) })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/account/jobs/${job.id}/edit`}
                className="font-medium underline underline-offset-4"
              >
                {t("editJob")}
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(job.id)}
                disabled={deletingId !== null}
                className="font-medium text-red-600 underline underline-offset-4 disabled:opacity-60 dark:text-red-400"
              >
                {t("deleteJob")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

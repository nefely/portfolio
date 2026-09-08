"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Job } from "@/content/jobs";

export function JobCard({ job, onApply }: { job: Job; onApply: (id: string) => void }) {
	const t = useTranslations("careers");
	const tJob = useTranslations(`careers.jobs.${job.id}`);
	const [expanded, setExpanded] = useState(false);
	const requirements = tJob.raw("requirements") as string[];

	return (
		<div className="border-border bg-surface hover:bg-surface-hover hover:border-primary/60 rounded-lg border p-6 transition-colors">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 className="text-foreground text-lg font-semibold">{tJob("title")}</h3>
					<p className="text-muted mt-1 text-sm">{tJob("summary")}</p>
				</div>
				<button
					type="button"
					onClick={() => onApply(job.id)}
					className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 rounded-md px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
				>
					{t("apply")}
				</button>
			</div>

			<dl className="text-muted mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
				<div className="flex items-center gap-1.5">
					<dt className="sr-only">{t("jobMeta.department")}</dt>
					<dd>{tJob("department")}</dd>
				</div>
				<div className="flex items-center gap-1.5">
					<dt className="sr-only">{t("jobMeta.location")}</dt>
					<dd>{tJob("location")}</dd>
				</div>
				<div className="flex items-center gap-1.5">
					<dt className="sr-only">{t("jobMeta.type")}</dt>
					<dd>{tJob("type")}</dd>
				</div>
			</dl>

			<button
				type="button"
				onClick={() => setExpanded((value) => !value)}
				aria-expanded={expanded}
				className="text-primary mt-4 flex items-center gap-1.5 text-sm font-medium"
			>
				{t("viewRole")}
				<motion.svg
					animate={{ rotate: expanded ? 180 : 0 }}
					transition={{ duration: 0.2 }}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-4"
				>
					<path d="m6 9 6 6 6-6" />
				</motion.svg>
			</button>

			<AnimatePresence initial={false}>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<p className="text-foreground/90 mt-4 text-sm">{tJob("description")}</p>
						<p className="text-foreground mt-4 text-sm font-semibold">
							{t("requirementsTitle")}
						</p>
						<ul className="mt-2 space-y-1.5">
							{requirements.map((requirement) => (
								<li key={requirement} className="text-muted flex gap-2 text-sm">
									<span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
									{requirement}
								</li>
							))}
						</ul>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

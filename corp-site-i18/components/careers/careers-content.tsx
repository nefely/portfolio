"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { Job } from "@/content/jobs";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/fade-in";
import { JobCard } from "@/components/careers/job-card";
import { ContactForm } from "@/components/careers/contact-form";

export function CareersContent({ jobs }: { jobs: Job[] }) {
	const t = useTranslations("careers");
	const [selectedPosition, setSelectedPosition] = useState("general");
	const formRef = useRef<HTMLDivElement>(null);

	function handleApply(jobId: string) {
		setSelectedPosition(jobId);
		formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	return (
		<div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
			<FadeIn>
				<h2 className="text-foreground text-2xl font-bold tracking-tight">
					{t("listTitle")}
				</h2>
			</FadeIn>

			<FadeInStagger className="mt-6 space-y-4">
				{jobs.map((job) => (
					<FadeInStaggerItem key={job.id}>
						<JobCard job={job} onApply={handleApply} />
					</FadeInStaggerItem>
				))}
			</FadeInStagger>

			<div id="contact" ref={formRef} className="mt-16 scroll-mt-24">
				<FadeIn>
					<h2 className="text-foreground text-2xl font-bold tracking-tight">
						{t("form.title")}
					</h2>
					<p className="text-muted mt-2">{t("form.subtitle")}</p>
				</FadeIn>
				<FadeIn delay={0.1} className="mt-6">
					<ContactForm
						jobs={jobs}
						selectedPosition={selectedPosition}
						onPositionChange={setSelectedPosition}
					/>
				</FadeIn>
			</div>
		</div>
	);
}

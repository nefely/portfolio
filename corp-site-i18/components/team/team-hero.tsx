"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/fade-in";
import { SectionLabel } from "@/components/ui/section-label";

export function TeamHero() {
	const t = useTranslations("team.hero");

	return (
		<section className="bg-dot-grid relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 mask-[radial-gradient(60%_70%_at_50%_0%,black,transparent)]"
			/>
			<div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
				<FadeIn>
					<SectionLabel>{t("eyebrow")}</SectionLabel>
					<h1 className="text-foreground mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
						{t("title")}
					</h1>
					<p className="text-muted mt-6 text-lg text-balance">{t("subtitle")}</p>
				</FadeIn>
			</div>
		</section>
	);
}

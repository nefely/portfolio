"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/fade-in";
import { ArrowLink } from "@/components/ui/arrow-link";

export function CtaSection() {
	const t = useTranslations("home.cta");

	return (
		<section className="bg-dot-grid mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
			<FadeIn className="border-border bg-primary relative overflow-hidden border px-6 py-16 text-center sm:px-16">
				<span
					aria-hidden
					className="bracket-corner bracket-corner--tl bracket-corner--on-primary"
				/>
				<span
					aria-hidden
					className="bracket-corner bracket-corner--tr bracket-corner--on-primary"
				/>
				<span
					aria-hidden
					className="bracket-corner bracket-corner--bl bracket-corner--on-primary"
				/>
				<span
					aria-hidden
					className="bracket-corner bracket-corner--br bracket-corner--on-primary"
				/>
				<h2 className="text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl">
					{t("title")}
				</h2>
				<p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl text-lg">
					{t("subtitle")}
				</p>
				<ArrowLink href="/careers" variant="invert" className="mt-8">
					{t("button")}
				</ArrowLink>
			</FadeIn>
		</section>
	);
}

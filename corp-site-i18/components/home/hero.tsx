"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { SectionLabel } from "@/components/ui/section-label";
import { ArrowLink } from "@/components/ui/arrow-link";

export function Hero() {
	const t = useTranslations("home.hero");

	return (
		<section className="bg-dot-grid relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 mask-[radial-gradient(60%_60%_at_50%_0%,black,transparent)]"
			/>
			<div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<SectionLabel>{t("eyebrow")}</SectionLabel>
				</motion.div>
				<motion.h1
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-foreground mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
				>
					{t("title")}
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="text-muted mt-6 max-w-2xl text-lg text-balance"
				>
					{t("subtitle")}
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="mt-10 flex flex-col gap-3 sm:flex-row"
				>
					<ArrowLink href="/careers">{t("primaryCta")}</ArrowLink>
					<ArrowLink href="/team" variant="outline">
						{t("secondaryCta")}
					</ArrowLink>
				</motion.div>
			</div>
		</section>
	);
}

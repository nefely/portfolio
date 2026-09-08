"use client";

import { useTranslations } from "next-intl";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/fade-in";

const KEYS = ["years", "projects", "clients", "countries"] as const;

export function Stats() {
	const t = useTranslations("home.stats");

	return (
		<section className="border-border bg-surface border-y">
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
				<FadeIn>
					<h2 className="text-muted text-center font-mono text-xs tracking-[0.2em] uppercase">
						{t("title")}
					</h2>
				</FadeIn>
				<FadeInStagger className="border-border divide-border mt-8 grid grid-cols-2 divide-x divide-y border lg:grid-cols-4 lg:divide-y-0">
					{KEYS.map((key) => (
						<FadeInStaggerItem
							key={key}
							className="bg-background hover:bg-surface-hover flex flex-col items-center px-4 py-8 text-center transition-colors"
						>
							<p className="text-primary text-4xl font-bold tracking-tight sm:text-5xl">
								{t(`${key}.value`)}
							</p>
							<p className="text-muted mt-2 text-sm">{t(`${key}.label`)}</p>
						</FadeInStaggerItem>
					))}
				</FadeInStagger>
			</div>
		</section>
	);
}

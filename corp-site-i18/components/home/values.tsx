"use client";

import { useTranslations } from "next-intl";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/fade-in";

const ITEMS = [
	{
		key: "craft",
		icon: <path d="m12 3 2.5 5.5L20 10l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5Z" />,
	},
	{
		key: "speed",
		icon: <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6Z" />,
	},
	{
		key: "partnership",
		icon: (
			<>
				<circle cx="8" cy="9" r="3" />
				<circle cx="16" cy="9" r="3" />
				<path d="M2 20c.5-3.5 3-5.5 6-5.5S14 16.5 14 20M12 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5" />
			</>
		),
	},
	{
		key: "scale",
		icon: (
			<>
				<path d="M3 17 9 11l4 4 8-8" />
				<path d="M15 6h6v6" />
			</>
		),
	},
] as const;

export function Values() {
	const t = useTranslations("home.values");

	return (
		<section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
			<FadeIn className="mx-auto max-w-2xl text-center">
				<h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
					{t("title")}
				</h2>
				<p className="text-muted mt-4 text-lg">{t("subtitle")}</p>
			</FadeIn>

			<FadeInStagger className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
				{ITEMS.map((item, index) => (
					<FadeInStaggerItem
						key={item.key}
						className="border-border bg-surface border-t-primary hover:bg-surface-hover hover:border-primary/60 border border-t-2 p-6 transition-colors"
					>
						<div className="flex items-start justify-between">
							<span className="border-border text-primary flex size-10 items-center justify-center rounded-md border">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="size-5"
								>
									{item.icon}
								</svg>
							</span>
							<span className="text-muted font-mono text-xs">0{index + 1}</span>
						</div>
						<h3 className="text-foreground mt-4 text-base font-semibold">
							{t(`${item.key}.title`)}
						</h3>
						<p className="text-muted mt-2 text-sm">{t(`${item.key}.description`)}</p>
					</FadeInStaggerItem>
				))}
			</FadeInStagger>
		</section>
	);
}

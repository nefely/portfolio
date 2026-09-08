"use client";

import { useTranslations } from "next-intl";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/fade-in";

const ITEMS = [
	{
		key: "product",
		icon: (
			<path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" />
		),
	},
	{
		key: "design",
		icon: <path d="M12 19 3 10l5-7h8l5 7-9 9Zm0 0V10" />,
	},
	{
		key: "engineering",
		icon: (
			<>
				<path d="m8 9-4 3 4 3" />
				<path d="m16 9 4 3-4 3" />
				<path d="m13 5-2 14" />
			</>
		),
	},
	{
		key: "growth",
		icon: <path d="M3 3v18h18M7 15l4-5 3 3 5-7" />,
	},
] as const;

export function Services() {
	const t = useTranslations("home.services");

	return (
		<section className="bg-surface">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
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
							className="border-border bg-background border-t-primary hover:bg-surface-hover hover:border-primary/60 border border-t-2 p-6 transition-colors"
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
			</div>
		</section>
	);
}

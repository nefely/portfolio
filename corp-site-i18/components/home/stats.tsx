"use client";

import { useTranslations } from "next-intl";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/fade-in";

const KEYS = ["years", "projects", "clients", "countries"] as const;

// `divide-x`/`divide-y` only work for a one-dimensional sibling list — on this
// grid (2 cols on mobile, wrapping into 2 rows; 4 cols from lg up, a single
// row) they add borders based on DOM order rather than actual grid position,
// which doubles up borders on wrapped rows. So each cell's internal border is
// spelled out explicitly instead, matching its real neighbors at each
// breakpoint: right border unless it's the last column, bottom border unless
// it's the last row (mobile only — from lg there's just one row).
const BORDER_CLASSES = [
	"border-border border-r border-b lg:border-b-0",
	"border-border border-b lg:border-r lg:border-b-0",
	"border-border border-r",
	"",
] as const;

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
				<FadeInStagger className="border-border mt-8 grid grid-cols-2 border lg:grid-cols-4">
					{KEYS.map((key, index) => (
						<FadeInStaggerItem
							key={key}
							className={`bg-background hover:bg-surface-hover flex flex-col items-center px-4 py-8 text-center transition-colors ${BORDER_CLASSES[index]}`}
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

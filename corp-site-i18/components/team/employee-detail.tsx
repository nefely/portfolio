"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/fade-in";
import { ArrowLink } from "@/components/ui/arrow-link";
import type { Employee } from "@/content/employees";

export function EmployeeDetail({ employee }: { employee: Employee }) {
	const t = useTranslations(`team.members.${employee.id}`);
	const tTeam = useTranslations("team");
	const longBio = t.raw("longBio") as string[];
	const focusAreas = t.raw("focusAreas") as string[];

	return (
		<div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
			<FadeIn>
				<Link
					href="/team"
					className="text-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="size-4"
					>
						<path d="M19 12H5M11 18l-6-6 6-6" />
					</svg>
					{tTeam("backToTeam")}
				</Link>
			</FadeIn>

			<FadeIn
				delay={0.05}
				className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
			>
				{/* eslint-disable-next-line @next/next/no-img-element -- single fixed-size
				    local asset; next/image's srcset/fill machinery has nothing to optimize here */}
				<img
					src={employee.photo}
					alt={employee.name}
					className="border-border size-24 shrink-0 rounded-md border object-cover"
				/>
				<div>
					<h1 className="text-foreground text-3xl font-bold tracking-tight">
						{employee.name}
					</h1>
					<p className="text-primary mt-1 text-lg">{t("role")}</p>
					<p className="text-muted mt-1 text-sm">{t("location")}</p>
				</div>
			</FadeIn>

			<FadeIn
				delay={0.1}
				className="border-border bg-surface border-l-primary relative mt-10 border border-l-2 p-6"
			>
				<p className="text-foreground text-xl text-balance italic">“{t("quote")}”</p>
			</FadeIn>

			<FadeIn delay={0.15} className="mt-10 space-y-4">
				{longBio.map((paragraph) => (
					<p key={paragraph} className="text-foreground/90 text-base leading-relaxed">
						{paragraph}
					</p>
				))}
			</FadeIn>

			<FadeIn delay={0.2} className="mt-10">
				<h2 className="text-foreground font-mono text-xs tracking-[0.2em] uppercase">
					{tTeam("focusTitle")}
				</h2>
				<ul className="mt-3 flex flex-wrap gap-2">
					{focusAreas.map((area) => (
						<li
							key={area}
							className="border-border bg-surface text-foreground/80 rounded-md border px-3 py-1.5 text-sm"
						>
							{area}
						</li>
					))}
				</ul>
			</FadeIn>

			<FadeIn delay={0.25} className="mt-12">
				<ArrowLink href="/careers#contact">{tTeam("contactCta")}</ArrowLink>
			</FadeIn>
		</div>
	);
}

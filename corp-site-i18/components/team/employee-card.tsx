"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Employee } from "@/content/employees";

export function EmployeeCard({ employee }: { employee: Employee }) {
	const t = useTranslations(`team.members.${employee.id}`);
	const tTeam = useTranslations("team");

	return (
		<Link
			href={`/team/${employee.id}`}
			className="group border-border bg-surface hover:border-primary/50 block rounded-lg border p-6"
		>
			<div className="flex items-start justify-between">
				{/* eslint-disable-next-line @next/next/no-img-element -- single fixed-size
				    local asset; next/image's srcset/fill machinery has nothing to optimize here */}
				<img
					src={employee.photo}
					alt={employee.name}
					className="border-border size-14 shrink-0 rounded-md border object-cover"
				/>
				<span className="text-muted font-mono text-xs">{employee.order}</span>
			</div>
			<h3 className="text-foreground mt-4 text-lg font-semibold">{employee.name}</h3>
			<p className="text-primary text-sm">{t("role")}</p>
			<p className="text-muted mt-3 text-sm">{t("bio")}</p>
			<span className="text-foreground/80 group-hover:text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors">
				{tTeam("viewProfile")}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-4 transition-transform group-hover:translate-x-0.5"
				>
					<path d="M5 12h14M13 6l6 6-6 6" />
				</svg>
			</span>
		</Link>
	);
}

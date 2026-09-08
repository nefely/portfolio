import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TeamHero } from "@/components/team/team-hero";
import { TeamGrid } from "@/components/team/team-grid";
import { employees } from "@/content/employees";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "team.hero" });

	return { title: t("title") };
}

export default async function TeamPage({ params }: PageProps<"/[locale]/team">) {
	const { locale } = await params;
	setRequestLocale(locale);

	const sortedEmployees = [...employees].sort((a, b) => a.order - b.order);

	return (
		<>
			<TeamHero />
			<TeamGrid employees={sortedEmployees} />
		</>
	);
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CareersHero } from "@/components/careers/careers-hero";
import { CareersContent } from "@/components/careers/careers-content";
import { jobs } from "@/content/jobs";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "careers.hero" });

	return { title: t("title") };
}

export default async function CareersPage({ params }: PageProps<"/[locale]/careers">) {
	const { locale } = await params;
	setRequestLocale(locale);

	const sortedJobs = [...jobs].sort((a, b) => a.order - b.order);

	return (
		<>
			<CareersHero />
			<CareersContent jobs={sortedJobs} />
		</>
	);
}

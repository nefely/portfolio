import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Values } from "@/components/home/values";
import { Services } from "@/components/home/services";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<>
			<Hero />
			<Stats />
			<Values />
			<Services />
			<CtaSection />
		</>
	);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmployeeDetail } from "@/components/team/employee-detail";
import { employees, getEmployee } from "@/content/employees";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
	return routing.locales.flatMap((locale) =>
		employees.map((employee) => ({ locale, id: employee.id }))
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
	const { locale, id } = await params;
	const employee = getEmployee(id);
	if (!employee) return {};

	const t = await getTranslations({
		locale,
		namespace: `team.members.${id}`,
	});

	return { title: `${employee.name} — ${t("role")}` };
}

export default async function EmployeePage({ params }: PageProps<"/[locale]/team/[id]">) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const employee = getEmployee(id);
	if (!employee) notFound();

	return <EmployeeDetail employee={employee} />;
}

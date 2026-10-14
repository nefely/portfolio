import type { Metadata } from "next";
import { CompanyDetail } from "@/components/companies/CompanyDetail";

export const metadata: Metadata = { title: "Company" };

export default async function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  return <CompanyDetail key={id} id={id} />;
}

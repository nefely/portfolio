import type { Metadata } from "next";
import { DealDetail } from "@/components/deals/DealDetail";

export const metadata: Metadata = { title: "Deal" };

export default async function DealPage({ params }: PageProps<"/deals/[id]">) {
  const { id } = await params;
  // key: при переході між угодами локальний стан (діалоги) скидається.
  return <DealDetail key={id} id={id} />;
}

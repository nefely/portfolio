import type { Metadata } from "next";
import { ContactDetail } from "@/components/contacts/ContactDetail";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  const { id } = await params;
  return <ContactDetail key={id} id={id} />;
}

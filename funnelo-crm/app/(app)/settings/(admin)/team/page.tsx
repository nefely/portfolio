import type { Metadata } from "next";
import { TeamSettings } from "@/components/settings/TeamSettings";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return <TeamSettings />;
}

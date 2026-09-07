import type { Metadata } from "next";
import { PageHeader } from "../components/page-header";
import { TeamGrid } from "../components/team-grid";
import CultureSection from "../components/culture";

export const metadata: Metadata = {
  title: "Team — Apex Growth",
  description: "Meet the A-players behind Apex Growth — ownership-driven, remote-first, fast.",
};

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Meet the team"
        title="A-players only"
        description="Chicago-based, globally remote. Everyone here owns their numbers and moves without waiting to be asked."
      />
      <TeamGrid />
      <CultureSection />
    </>
  );
}

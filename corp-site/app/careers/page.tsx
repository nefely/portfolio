import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "../components/page-header";
import { JobList } from "../components/job-list";
import { Reveal } from "../components/motion/reveal";

export const metadata: Metadata = {
  title: "Careers — Apex Growth",
  description: "Join Apex Growth — open roles for A-players who own their numbers.",
};

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Join the team"
        description="We hire ownership-driven people and get out of their way. Radical focus, fast execution, no fluff."
      />
      <JobList />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal className="rounded-3xl border border-white/10 bg-linear-to-br from-violet-600/20 via-white/2 to-transparent px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-semibold text-white">Don&apos;t see your role?</h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-400">
            We&apos;re always open to hearing from A-players. Reach out and tell us what you&apos;d
            bring to the team.
          </p>
          <Link
            href="mailto:hello@apexgrowth.co"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-violet-200"
          >
            Get in touch
          </Link>
        </Reveal>
      </section>
    </>
  );
}

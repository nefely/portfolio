import Link from "next/link";
import { RevealGroup, RevealItem } from "./motion/reveal";

// Placeholder openings — swap in real listings when ready.
const OPENINGS = [
  {
    title: "Senior Media Buyer",
    location: "Remote",
    description: "Own paid social budgets end-to-end across Meta and TikTok.",
  },
  {
    title: "Creative Strategist",
    location: "Remote",
    description: "Turn performance data into ad concepts our editors can ship fast.",
  },
  {
    title: "Growth Engineer",
    location: "Remote / Chicago, IL",
    description: "Build the internal tooling that automates scaling and reporting.",
  },
  {
    title: "Account Lead",
    location: "Remote",
    description: "Be the strategic point of contact for a portfolio of growth accounts.",
  },
];

export function JobList() {
  return (
    <RevealGroup className="mx-auto max-w-3xl space-y-4 px-6 pb-24">
      {OPENINGS.map((job) => (
        <RevealItem
          key={job.title}
          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/3 p-6 transition-colors hover:border-violet-400/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-white">{job.title}</p>
            <p className="mt-1 text-sm text-neutral-400">{job.description}</p>
            <span className="mt-2 inline-block rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400">
              {job.location}
            </span>
          </div>

          <Link
            href={`mailto:hello@apexgrowth.co?subject=Application: ${job.title}`}
            className="shrink-0 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Apply
          </Link>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

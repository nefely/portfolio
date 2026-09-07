import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";

const PRINCIPLES = [
  "Ownership over micromanagement — we hire A-players and trust them to run.",
  "Radical focus on the metrics that move revenue, nothing else.",
  "Fast execution beats a perfect plan that ships late.",
  "No fluff — every decision is backed by data, not opinion.",
];

export default function CultureSection() {
  return (
    <section id="culture" className="border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A-players only
          </h2>
          <p className="mt-4 max-w-md text-neutral-400">
            Chicago-based, globally remote. Everyone on the team owns their numbers and moves
            without waiting to be asked.
          </p>
        </Reveal>

        <RevealGroup className="space-y-5" stagger={0.1}>
          {PRINCIPLES.map((principle) => (
            <RevealItem key={principle} className="flex gap-4 text-neutral-300">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
              <span>{principle}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

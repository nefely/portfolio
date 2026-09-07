import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";

const STEPS = [
  {
    title: "Audit",
    description:
      "We dig into your funnel, creative, and account structure to find where budget is leaking.",
  },
  {
    title: "Test",
    description: "Rapid creative and audience testing, tracked back to revenue from day one.",
  },
  {
    title: "Scale",
    description: "Winning combinations get budget fast, backed by our automation stack.",
  },
  {
    title: "Report",
    description: "Weekly, no-fluff reporting so you always know exactly what's working.",
  },
];

export default function ProcessSection() {
  return (
    <section className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            How we work
          </h2>
          <p className="mt-4 text-neutral-400">
            The same four steps for every account — no reinventing the process per client.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {STEPS.map((step, index) => (
            <RevealItem key={step.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-sm font-semibold text-violet-300">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-400">{step.description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

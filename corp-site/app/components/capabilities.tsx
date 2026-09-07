import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { CapabilityCard } from "./capability-card";

const CAPABILITIES = [
  {
    title: "Paid media mastery",
    description:
      "Deep platform expertise across Meta, TikTok, and Google — every dollar is tracked back to revenue, not vanity metrics.",
  },
  {
    title: "Creative at scale",
    description:
      "1,000+ ad creatives produced every year by an in-house team, so we can test faster than the algorithm can settle.",
  },
  {
    title: "Growth automation",
    description:
      "20+ proprietary tools automate scaling, reporting, and bid management — no manual work slowing execution down.",
  },
];

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Traffic and execution, built for scale
        </h2>
        <p className="mt-4 text-neutral-400">
          Three pillars keep every campaign moving fast — platform expertise, creative volume, and
          aggressive automation.
        </p>
      </Reveal>

      <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
        {CAPABILITIES.map((item) => (
          <RevealItem key={item.title}>
            <CapabilityCard title={item.title} description={item.description} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

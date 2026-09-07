import { RevealGroup, RevealItem } from "./motion/reveal";
import { Counter } from "./motion/counter";

const STATS = [
  { value: 500, prefix: "$", suffix: "K+", label: "Monthly ad spend managed" },
  { value: 3000, suffix: "+", label: "Video ads produced yearly" },
  { value: 20, suffix: "+", label: "Proprietary growth tools" },
  { value: 1000, suffix: "+", label: "Creatives shipped every year" },
];

export default function StatsSection() {
  return (
    <section className="border-y border-white/5 bg-white/2">
      <RevealGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {STATS.map((stat) => (
          <RevealItem key={stat.label} className="text-center md:text-left">
            <p className="text-3xl font-semibold text-white sm:text-4xl">
              <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm text-neutral-400">{stat.label}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

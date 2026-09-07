import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";

// Placeholder quotes — swap in real client testimonials when ready.
const TESTIMONIALS = [
  {
    quote:
      "Apex rebuilt our paid funnel in three weeks and cut CAC by 38%. No fluff, just results.",
    name: "Dana Whitfield",
    role: "VP Growth, Northwind Supply",
    image: "/DW.webp",
  },
  {
    quote: "Their reporting is the first I've trusted enough to take straight to my board.",
    name: "Marcus Ellery",
    role: "CMO, Solace Home",
    image: "/ME.webp",
  },
  {
    quote: "We tripled ad spend and our ROAS actually went up. That never happens.",
    name: "Priya Shah",
    role: "Founder, Loomlight",
    image: "/PS.webp",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="border-t border-white/5 bg-white/2">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            What clients say
          </h2>
          <p className="mt-4 text-neutral-400">
            We don&apos;t win pitches on promises — here&apos;s what it looks like once we&apos;re
            actually running the account.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
          {TESTIMONIALS.map((item) => (
            <RevealItem
              key={item.name}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/3 p-8"
            >
              <p className="grow text-neutral-300">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.role}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

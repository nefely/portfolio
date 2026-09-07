import Link from "next/link";
import { Reveal } from "./motion/reveal";

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-violet-600/20 via-white/2 to-transparent px-8 py-16 text-center sm:px-16">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to scale performance?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-neutral-400">
          Whether you want to grow your ad spend or join a team of A-players, we&apos;d love to hear
          from you.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/#contact"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-violet-200"
          >
            Contact now
          </Link>
          <Link
            href="/careers"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Join the team
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

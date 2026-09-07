"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { RevealGroup, RevealItem } from "./motion/reveal";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="h-[480px] w-[780px] rounded-full bg-linear-to-tr from-violet-600/40 via-fuchsia-500/20 to-transparent" />
      </motion.div>

      <RevealGroup
        stagger={0.15}
        className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-24 text-center md:pt-36 md:pb-32"
      >
        <RevealItem>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-300 uppercase">
            Performance Marketing Agency
          </span>
        </RevealItem>

        <RevealItem className="mt-8 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
            Built on data. <br className="hidden sm:block" />
            Driven by{" "}
            <span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              results.
            </span>
          </h1>
        </RevealItem>

        <RevealItem className="mt-6 max-w-xl">
          <p className="text-lg text-neutral-400">
            Radical focus, ownership, fast execution, no fluff. We test, track, and optimize
            everything — every strategy is backed by ROI, not opinion.
          </p>
        </RevealItem>

        <RevealItem className="mt-10 flex flex-col gap-4 sm:flex-row">
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
        </RevealItem>
      </RevealGroup>
    </section>
  );
}

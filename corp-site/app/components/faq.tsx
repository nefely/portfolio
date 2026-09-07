"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";

const FAQS = [
  {
    question: "What's your minimum ad spend?",
    answer:
      "We typically work with brands spending $20K+/month on paid media, so there's enough signal to test and scale properly.",
  },
  {
    question: "How fast can we get started?",
    answer:
      "Most accounts are live within two weeks of signing, after a short audit of your current setup.",
  },
  {
    question: "Do you require a long-term contract?",
    answer:
      "No. We work month-to-month — we keep clients by hitting numbers, not by locking them in.",
  },
  {
    question: "Who owns the creative?",
    answer: "You do. Every ad, hook, and asset we produce is yours to keep and reuse.",
  },
  {
    question: "How do you report results?",
    answer:
      "A weekly summary tied to revenue and ROAS, plus live dashboard access — no waiting for a monthly call.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-medium text-white">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-2xl leading-none text-violet-400"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-neutral-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 space-y-4" stagger={0.08}>
          {FAQS.map((faq) => (
            <RevealItem key={faq.question}>
              <FaqItem question={faq.question} answer={faq.answer} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

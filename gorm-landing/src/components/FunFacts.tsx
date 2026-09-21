import { motion } from "framer-motion"
import fact1 from "../assets/icons/fact-1.svg"
import fact2 from "../assets/icons/fact-2.svg"
import fact3 from "../assets/icons/fact-3.svg"
import fact4 from "../assets/icons/fact-4.svg"
import Reveal from "./ui/Reveal"
import RevealGroup, { RevealItem } from "./ui/RevealGroup"

const facts = [
  { value: "10", label: "Years on market", icon: fact1 },
  { value: "340+", label: "Project done", icon: fact2 },
  { value: "17", label: "Hero's member", icon: fact3 },
  { value: "900+", label: "Cups of coffee", icon: fact4 },
]

function FunFacts() {
  return (
    <section className="border-b border-white/15 py-20">
      <div className="mx-auto max-w-[1600px] px-6 text-center lg:px-12">
        <Reveal>
          <h2 className="mb-14 text-4xl font-medium uppercase tracking-tight text-white">
            Fun facts
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <RevealItem key={fact.label}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-stretch overflow-hidden rounded-xl bg-card"
              >
                <div className="flex w-28 shrink-0 items-center justify-center bg-white/5">
                  <img src={fact.icon} alt="" className="h-10 w-10" />
                </div>
                <div className="flex flex-col justify-center px-4 py-8 text-left">
                  <div className="text-3xl font-semibold text-white">{fact.value}</div>
                  <div className="text-sm text-body">{fact.label}</div>
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

export default FunFacts

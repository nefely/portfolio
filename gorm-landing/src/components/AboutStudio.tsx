import { motion } from "framer-motion"
import Reveal from "./ui/Reveal"

function AboutStudio() {
  return (
    <section className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-12">
        <Reveal>
          <h2 className="text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-7xl">
            We're a creative digital studio
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-6">
          <p className="max-w-xl text-lg leading-relaxed text-body">
            We are a forward-thinking team of designers and developers driven
            by passion — and fuelled by curiosity.
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-body">
            We believe that the human dimensions essential to start any
            successful project and that this is where splendid emotional
            relationships between the company and people are born.
          </p>
          <motion.a
            href="#team"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-2 w-fit rounded bg-red px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-dark"
          >
            Meet the team
          </motion.a>
        </Reveal>
      </div>
    </section>
  )
}

export default AboutStudio

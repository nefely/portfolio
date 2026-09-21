import { motion } from "framer-motion"
import iconPrototyping from "../assets/icons/build-icon-1.svg"
import iconWebDesign from "../assets/icons/build-icon-2.svg"
import iconDevelopment from "../assets/icons/build-icon-3.svg"
import Reveal from "./ui/Reveal"
import RevealGroup, { RevealItem } from "./ui/RevealGroup"

const services = [
  {
    title: "Prototyping",
    text: "Make sure you're building the right product.",
    icon: iconPrototyping,
  },
  {
    title: "Web design",
    text: "Attract and engage your customers online.",
    icon: iconWebDesign,
  },
  {
    title: "Development",
    text: "Ensure your site meets your users' standards.",
    icon: iconDevelopment,
  },
]

function Experiences() {
  return (
    <section className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <h2 className="mb-16 text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-7xl">
            We build experiences
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <RevealItem key={service.title}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="overflow-hidden rounded-xl bg-card text-center shadow-none transition-shadow duration-300 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="flex items-center justify-center bg-white/5 py-12">
                  <motion.div
                    whileHover={{ rotate: 6, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="flex h-30 w-30 items-center justify-center rounded-2xl bg-red p-7"
                  >
                    <img src={service.icon} alt="" className="h-full w-full rounded-lg" />
                  </motion.div>
                </div>
                <div className="px-8 py-8">
                  <h3 className="mb-2 text-lg font-semibold uppercase tracking-wide text-white">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">{service.text}</p>
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

export default Experiences

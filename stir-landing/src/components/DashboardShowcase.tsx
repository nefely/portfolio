import { motion } from 'framer-motion'
import dashboardMockup from '../assets/figma/dashboard-mockup.png'

export function DashboardShowcase() {
  return (
    <section className="relative mx-auto w-full max-w-[1199px] px-6 pb-16 lg:px-0 lg:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl shadow-[0_-16px_64px_rgba(43,42,53,0.32)]"
      >
        <img src={dashboardMockup} alt="Stir dashboard" className="w-full" />
      </motion.div>
      <button
        type="button"
        className="absolute right-6 -bottom-5 rounded-full bg-ink px-6 py-2.5 text-sm text-[#ededed] shadow-[4px_0_16px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[4px_8px_24px_rgba(0,0,0,0.35)] lg:right-12"
      >
        Try it out
      </button>
    </section>
  )
}

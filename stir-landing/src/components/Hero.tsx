import { motion } from 'framer-motion'

const easing = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section id="top" className="mx-auto w-full max-w-[1199px] px-6 pt-10 pb-16 text-center lg:px-0 lg:pt-16 lg:pb-20">
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easing }}
        className="mx-auto max-w-4xl text-[36px] leading-[1.06] font-normal tracking-tight text-ink lg:text-[64px]"
      >
        Where creators run their business.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: easing }}
        className="mx-auto mt-6 max-w-xl text-base text-ink lg:mt-8 lg:text-xl"
      >
        Meet Stir. The financial studio for collaborating, splitting revenue, money
        management and metrics—all in one place
      </motion.p>
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: easing }}
        className="mx-auto mt-8 flex w-full max-w-[478px] flex-col items-stretch gap-3 sm:flex-row sm:gap-0"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="h-14 w-full min-w-0 rounded-full border border-brand px-6 text-sm text-ink shadow-sm outline-none transition-shadow placeholder:text-ink/60 focus:shadow-md sm:flex-1 sm:rounded-r-none"
        />
        <button
          type="submit"
          className="h-14 shrink-0 rounded-full bg-brand px-8 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] hover:bg-brand-dark active:scale-95 sm:-ml-6 sm:rounded-l-none"
        >
          Get started
        </button>
      </motion.form>
    </section>
  )
}

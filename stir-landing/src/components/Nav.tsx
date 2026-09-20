import { motion } from 'framer-motion'
import { StirLogo } from './icons'

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-[1199px] items-center justify-between px-6 py-4 lg:px-0">
        <a href="#top" className="text-brand transition-transform duration-300 hover:scale-105">
          <StirLogo className="h-6 w-auto lg:h-7" />
        </a>
        <a
          href="#careers"
          className="group relative text-sm text-[#222] transition hover:text-brand"
        >
          Join our team
          <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
        </a>
      </div>
    </motion.header>
  )
}

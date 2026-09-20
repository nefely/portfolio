import { StirLogo } from './icons'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1199px] items-center justify-between px-6 py-4 lg:px-0">
        <a href="#top" className="text-brand">
          <StirLogo className="h-6 w-auto lg:h-7" />
        </a>
        <a
          href="#careers"
          className="text-sm text-[#222] transition hover:text-brand"
        >
          Join our team
        </a>
      </div>
    </header>
  )
}

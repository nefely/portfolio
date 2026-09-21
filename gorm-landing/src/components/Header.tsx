function Header() {
  return (
    <header className="border-b border-white/15">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 lg:px-12">
        <a href="#top" className="flex items-center">
          <span className="text-2xl font-bold uppercase tracking-tight text-white">
            G<span className="text-red">ö</span>rm
          </span>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#contact"
            className="rounded bg-red px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-dark"
          >
            Contact us
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header

import logo from "../assets/icons/logo.svg"

function Header() {
  return (
    <header className="border-b border-white/15">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-6">
          <a href="#top" className="flex items-center gap-3">
            <img src={logo} alt="Görm" className="h-8 w-auto" />
            <span className="hidden text-xs font-semibold uppercase leading-tight sm:block">
              Branding &amp;
              <br />
              Design Studio
            </span>
          </a>
          <span className="hidden h-8 w-px bg-white/15 md:block" />
          <span className="hidden text-xs font-semibold uppercase leading-tight text-white md:block">
            Double Bay 2028,
            <br />
            New York
          </span>
        </div>

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

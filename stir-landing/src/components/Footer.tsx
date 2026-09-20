import { StirLogo, InstagramIcon, TwitterIcon } from './icons'
import { Reveal } from './Reveal'

export function Footer() {
  return (
    <footer className="bg-brand py-16 text-white lg:py-20">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <Reveal className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-2xl lg:text-3xl">
              Cheers to a more
              <br />
              imaginative world.
            </h2>
            <form
              className="mt-6 flex w-full max-w-[360px] items-stretch"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Subscribe for updates"
                className="h-12 w-full min-w-0 flex-1 rounded-l-full rounded-r-none border border-white bg-white px-6 text-sm text-ink shadow-sm outline-none transition-shadow placeholder:text-muted focus:shadow-md"
              />
              <button
                type="submit"
                className="-ml-6 h-12 shrink-0 rounded-r-full rounded-l-none bg-ink px-6 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] hover:bg-ink-soft active:scale-95"
              >
                ok
              </button>
            </form>
          </div>
          <StirLogo className="h-8 w-auto transition-transform duration-300 hover:scale-105 lg:h-9" />
        </Reveal>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <a
              href="#instagram"
              className="flex items-center gap-2 text-sm text-white/90 transition-colors duration-300 hover:text-white"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
            <a
              href="#twitter"
              className="flex items-center gap-2 text-sm text-white/90 transition-colors duration-300 hover:text-white"
            >
              <TwitterIcon className="h-4 w-4" />
              Twitter
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/90">
            <a href="#terms" className="transition-colors duration-300 hover:text-white">
              Terms
            </a>
            <a href="#privacy" className="transition-colors duration-300 hover:text-white">
              Privacy
            </a>
            <span className="font-bold text-white">&copy; Stir 2021</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

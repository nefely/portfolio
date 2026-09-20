import { StirLogo, InstagramIcon, TwitterIcon } from './icons'

export function Footer() {
  return (
    <footer className="bg-brand py-16 text-white lg:py-20">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-2xl lg:text-3xl">
              Cheers to a more
              <br />
              imaginative world.
            </h2>
            <form
              className="mt-6 flex w-full max-w-[360px] items-center justify-between rounded-full border border-white px-6 py-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Subscribe for updates"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white"
              />
              <button type="submit" className="shrink-0 text-sm">
                ok
              </button>
            </form>
          </div>
          <StirLogo className="h-8 w-auto lg:h-9" />
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <a href="#instagram" className="flex items-center gap-2 text-sm text-white/90">
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
            <a href="#twitter" className="flex items-center gap-2 text-sm text-white/90">
              <TwitterIcon className="h-4 w-4" />
              Twitter
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/90">
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <span className="font-bold text-white">&copy; Stir 2021</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

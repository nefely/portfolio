import heroLeft from "../assets/images/hero-left.png"
import heroRight from "../assets/images/hero-right.png"
import heroCenter from "../assets/images/hero-center.png"
import arrowRight from "../assets/icons/arrow-right.svg"
import instagramIcon from "../assets/icons/instagram.svg"
import twitterIcon from "../assets/icons/twitter.svg"
import dribbbleIcon from "../assets/icons/dribble.svg"

const socials = [
  { name: "Instagram", icon: instagramIcon },
  { name: "Twitter", icon: twitterIcon },
  { name: "Dribbble", icon: dribbbleIcon },
]

function Hero() {
  return (
    <section id="top" className="relative border-b border-white/15 pb-10 pt-24 lg:pt-32">
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-12">
        <h1 className="max-w-5xl text-[15vw] font-semibold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
          Branding &amp; digital design sutdio.
        </h1>

        {/* vertical social rail, centered on the heading block */}
        <div className="absolute inset-y-0 right-6 hidden flex-col items-center justify-center gap-8 lg:right-12 lg:flex">
          {socials.map((s) => (
            <a
              key={s.name}
              href="#top"
              className="flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white"
            >
              <img src={s.icon} alt="" className="h-4 w-4" />
              <span className="[writing-mode:vertical-rl]">{s.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1600px] pl-6 lg:pl-12">
        <div className="mb-6 flex items-center justify-end pr-6 lg:pr-12">
          <button
            type="button"
            aria-label="Next"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 transition-colors hover:bg-neutral-800"
          >
            <img src={arrowRight} alt="" className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex flex-col items-start gap-8 pr-6 sm:flex-row sm:items-center sm:pr-0">
          <img
            src={heroLeft}
            alt="Görm team member sketching at a desk"
            className="h-auto w-full min-w-0 shrink-0 sm:w-[44%]"
          />
          <img
            src={heroRight}
            alt="Görm team collaborating around a table"
            className="h-auto w-full min-w-0 sm:flex-1"
          />

          {/* showreel badge, centered on the seam between the two images */}
          <button
            type="button"
            aria-label="Play showreel"
            className="absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite] hover:[animation-play-state:paused] sm:left-[44%]"
          >
            <img src={heroCenter} alt="Play showreel" className="h-full w-full" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero

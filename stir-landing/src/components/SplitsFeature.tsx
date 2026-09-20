import { SplitsIcon, YoutubeGlyph, PatreonGlyph, ShopifyGlyph, AnchorGlyph, StripeGlyph, OnlyFansGlyph } from './icons'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import splitsMockup from '../assets/figma/splits-mockup.png'

const platforms = [
  { name: 'YouTube', icon: <YoutubeGlyph className="h-4 w-4" />, bg: '#282828' },
  { name: 'Patreon', icon: <PatreonGlyph className="h-4 w-4" />, bg: '#f14b54' },
  { name: 'Shopify', icon: <ShopifyGlyph className="h-4 w-4" />, bg: '#009771' },
  { name: 'Anchor', icon: <AnchorGlyph className="h-4 w-4" />, bg: '#5000b9' },
  { name: 'Stripe', icon: <StripeGlyph className="h-4 w-4" />, bg: '#635bff' },
  { name: 'OnlyFans', icon: <OnlyFansGlyph className="h-4 w-4" />, bg: '#01aff1' },
]

export function SplitsFeature() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink-soft">
              <SplitsIcon className="h-4 w-4" />
              Splits
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg font-bold text-gold lg:text-xl">
              If you want to go far, go together
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-ink lg:text-[64px]">
              Get creative with others in just a Split.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="text-left">
            <p className="text-xl font-bold text-ink lg:text-2xl">
              Split the revenue on a video, a line of merch, or that latest and
              greatest podcast. The possibilities are endless when you share
              upside together.
            </p>
            <p className="mt-12 text-sm font-medium tracking-wider text-gold">
              SUPPORTED PLATFORMS
            </p>
            <RevealGroup className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              {platforms.map((p) => (
                <RevealItem key={p.name}>
                  <div className="flex w-fit items-center gap-2 rounded-full border border-line px-2.5 py-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:shadow-md sm:gap-3 sm:px-4 sm:py-2">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white sm:h-6 sm:w-6"
                      style={{ background: p.bg }}
                    >
                      {p.icon}
                    </span>
                    <span className="text-sm text-ink sm:text-base">{p.name}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>
          <Reveal delay={0.15} className="overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <img
              src={splitsMockup}
              alt="Stir new split screen"
              className="w-full transition-transform duration-500 hover:scale-105"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

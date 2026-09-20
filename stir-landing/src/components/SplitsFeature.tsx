import { SplitsIcon, YoutubeGlyph, PatreonGlyph, ShopifyGlyph, AnchorGlyph, StripeGlyph, OnlyFansGlyph } from './icons'
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
          <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink-soft">
            <SplitsIcon className="h-4 w-4" />
            Splits
          </span>
          <p className="mt-6 text-lg font-bold text-gold lg:text-xl">
            If you want to go far, go together
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-ink lg:text-[64px]">
            Get creative with others in just a Split.
          </h2>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <p className="text-xl font-bold text-ink lg:text-2xl">
              Split the revenue on a video, a line of merch, or that latest and
              greatest podcast. The possibilities are endless when you share
              upside together.
            </p>
            <p className="mt-12 text-sm font-medium tracking-wider text-gold">
              SUPPORTED PLATFORMS
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {platforms.map((p) => (
                <li
                  key={p.name}
                  className="flex w-fit items-center gap-3 rounded-full border border-line px-4 py-2"
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                    style={{ background: p.bg }}
                  >
                    {p.icon}
                  </span>
                  <span className="text-base text-ink">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <img src={splitsMockup} alt="Stir new split screen" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

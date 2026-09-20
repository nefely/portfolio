import {
  HomeIcon,
  PatreonGlyph,
  ShopifyGlyph,
  AnchorGlyph,
  YoutubeGlyph,
  TwitterIcon,
  InstagramIcon,
  TwitchGlyph,
  SubstackGlyph,
  SpotifyGlyph,
  FacebookGlyph,
  StripeGlyph,
  OnlyFansGlyph,
} from './icons'
import { motion } from 'framer-motion'
import { Reveal, RevealGroup, RevealItem } from './Reveal'

const easing = [0.22, 1, 0.36, 1] as const

const revenue = [
  { icon: <PatreonGlyph className="h-4 w-4" />, bg: '#f14b54', name: 'Patreon', status: 'Paid today', ytd: '$4270.05', pct: '45%', month: '$654.10' },
  { icon: <TwitchGlyph className="h-4 w-4" />, bg: '#9047ff', name: 'Twitch', status: 'Paid yesterday', ytd: '$300.23', pct: '3%', month: '$91.30' },
  { icon: <YoutubeGlyph className="h-4 w-4" />, bg: '#282828', name: 'YouTube', status: 'Paid on April 21', ytd: '$3500.28', pct: '36%', month: '$700.23' },
  { icon: <ShopifyGlyph className="h-4 w-4" />, bg: '#009771', name: 'Shopify', status: 'Paid on April 16', ytd: '$1125.13', pct: '12%', month: '$163.82' },
  { icon: <SubstackGlyph className="h-4 w-4" />, bg: '#f76418', name: 'Substack', status: 'Paid on April 4', ytd: '$382.46', pct: '4%', month: '$56.39' },
]

const platforms = [
  { icon: <YoutubeGlyph className="h-5 w-5" />, bg: '#282828' },
  { icon: <PatreonGlyph className="h-5 w-5" />, bg: '#f14b54' },
  { icon: <ShopifyGlyph className="h-5 w-5" />, bg: '#009771' },
  { icon: <AnchorGlyph className="h-5 w-5" />, bg: '#5000b9' },
  { icon: <InstagramIcon className="h-4 w-4" />, bg: '#c13584' },
  { icon: <TwitchGlyph className="h-5 w-5" />, bg: '#9047ff' },
  { icon: <SubstackGlyph className="h-5 w-5" />, bg: '#f76418' },
  { icon: <SpotifyGlyph className="h-5 w-5" />, bg: '#1ed760' },
  { icon: <TwitterIcon className="h-4 w-4" />, bg: '#1da1f2' },
  { icon: <FacebookGlyph className="h-5 w-5" />, bg: '#4267b2' },
  { icon: <StripeGlyph className="h-5 w-5" />, bg: '#635bff' },
  { icon: <OnlyFansGlyph className="h-5 w-5" />, bg: '#01aff1' },
]

export function HomeFeature() {
  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand">
              <HomeIcon className="h-4 w-4" />
              Home
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-brand lg:text-xl">Your entire business at a glance</p>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl leading-tight text-ink lg:text-[64px]">
              Stay organized. Without any extra work.
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 flex flex-wrap justify-center gap-6 lg:gap-10">
            {['Spreadsheets', 'Notes App', 'Quickbooks'].map((word) => (
              <RevealItem key={word}>
                <span className="relative text-xl text-ink lg:text-2xl">
                  {word}
                  <span className="absolute inset-x-[-10px] top-1/2 -z-10 h-[3px] bg-gold" />
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-[859px] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="px-6 py-6">
            <span className="text-base text-ink">Revenue Breakdown</span>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-muted">
                <th className="px-6 pb-3 text-left font-normal">Channel</th>
                <th className="px-6 pb-3 text-right font-normal">Year to date</th>
                <th className="hidden px-6 pb-3 text-right font-normal sm:table-cell">Breakdown</th>
                <th className="px-6 pb-3 text-right font-normal">This month</th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.08 }}
            >
              {revenue.map((row, i) => (
                <motion.tr
                  key={row.name}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: easing } },
                  }}
                  className="border-t border-line transition-colors duration-300 hover:bg-cream/60"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 hover:scale-110"
                        style={{ background: row.bg }}
                      >
                        {row.icon}
                      </span>
                      <div className="text-left">
                        <p className="text-sm text-ink">{row.name}</p>
                        <p className="text-xs text-muted">{row.status}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-ink">{row.ytd}</td>
                  <td className="hidden px-6 py-4 text-right text-ink sm:table-cell">{row.pct}</td>
                  <td className="px-6 py-4 text-right text-ink">{row.month}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto mt-8 max-w-[859px] rounded-2xl border border-line-soft p-8 lg:p-12">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-left">
              <h3 className="text-2xl text-ink lg:text-[40px] lg:leading-tight">
                Works with all
                <br />
                the ways you make
                <br />
                money
              </h3>
              <p className="mt-4 text-base text-muted">Missing one you need? We&rsquo;ll add it.</p>
            </div>
            <RevealGroup className="grid grid-cols-4 gap-4">
              {platforms.map((p, i) => (
                <RevealItem key={i}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform duration-300 hover:scale-110 hover:shadow-lg"
                    style={{ background: p.bg }}
                  >
                    {p.icon}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

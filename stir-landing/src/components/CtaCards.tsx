import { HomeIcon, PayIcon, SplitsIcon, CollectivesIcon } from './icons'
import { Reveal, RevealGroup, RevealItem } from './Reveal'

const cards = [
  {
    icon: <HomeIcon className="h-5 w-5" />,
    bg: '#7352ff',
    title: 'Home',
    body: 'Everything your creator business needs collected in one easy-to-use place.',
  },
  {
    icon: <PayIcon className="h-5 w-5" />,
    bg: '#a4b96d',
    title: 'Pay',
    body: 'Free, fast, and professional. Modern payments for your modern business.',
  },
  {
    icon: <SplitsIcon className="h-5 w-5" />,
    bg: '#f6c627',
    title: 'Splits',
    body: 'Compensate collaborators with three clicks. Creativity is better with aligned incentives.',
  },
  {
    icon: <CollectivesIcon className="h-5 w-5" />,
    bg: '#6ee4b5',
    title: 'Collectives',
    body: 'Spin up joint ventures in seconds. It’s multiplayer mode for your business.',
  },
]

export function CtaCards() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 text-center lg:px-0">
        <Reveal>
          <p className="text-lg font-bold text-brand lg:text-xl">
            Less Administration, More Imagination
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-ink lg:text-[64px]">
            Get your business up and running on Stir
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <RevealItem key={card.title}>
              <div className="h-full rounded-2xl border border-line p-8 text-center shadow-[0_5px_10px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-[0_16px_32px_rgba(115,82,255,0.25)]">
                <span
                  className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform duration-300 hover:scale-110"
                  style={{ background: card.bg }}
                >
                  {card.icon}
                </span>
                <p className="mt-4 text-2xl text-ink">{card.title}</p>
                <p className="mt-3 text-base text-muted">{card.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

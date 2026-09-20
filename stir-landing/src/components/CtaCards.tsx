import { HomeIcon, PayIcon, SplitsIcon, CollectivesIcon } from './icons'

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
        <p className="text-lg font-bold text-brand lg:text-xl">
          Less Administration, More Imagination
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-ink lg:text-[64px]">
          Get your business up and running on Stir
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-line p-8 text-center shadow-[0_5px_10px_rgba(0,0,0,0.25)]"
            >
              <span
                className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: card.bg }}
              >
                {card.icon}
              </span>
              <p className="mt-4 text-2xl text-ink">{card.title}</p>
              <p className="mt-3 text-base text-muted">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

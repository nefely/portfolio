import { Fragment } from 'react'
import teamEric from '../assets/figma/team-eric.jpg'
import teamZack from '../assets/figma/team-zack.jpg'
import teamMack from '../assets/figma/team-mack.jpg'

const cards = [
  {
    number: '01',
    role: 'Creator',
    name: 'Eric Decker',
    photo: teamEric,
    bg: 'bg-cream',
    quote:
      '“Stir is the secret weapon of the creator world. I have multiple 12+ person splits running on Stir right now. It’s a game-changer for creators who strive to stay a cut above the rest.”',
    badge: 'Airrack | Case Study',
    rows: [
      { channel: 'YouTube', activity: 'Splits, Home' },
      { channel: 'Airrack.Shop', activity: 'Merch' },
    ],
  },
  {
    number: '02',
    role: 'Manager',
    name: 'Zack Honarvar',
    photo: teamZack,
    bg: 'bg-mint',
    quote:
      '“Without knowing about Stir, or what it could do we never would have been able to bring all of this work to life.”',
    badge: 'Airrack | Case Study',
    rows: [
      { channel: 'Channels', activity: '8 Collectives' },
      { channel: 'Shopify', activity: '4 Collectives' },
    ],
  },
  {
    number: '03',
    role: 'Editor',
    name: 'Mack Hopkins',
    photo: teamMack,
    bg: 'bg-gold',
    quote:
      '“Tracking payments in my Notes app made me super scattered. With Stir, I’ve split payments with 10 followers and 8 collaborators this week alone.”',
    badge: 'Airrack | Case Study',
    rows: [
      { channel: 'Channels', activity: 'Channels' },
      { channel: 'Shopify', activity: '4 Collectives' },
    ],
  },
]

export function TeamCards() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold text-ink lg:text-[40px] lg:leading-tight">
          We&rsquo;ve got something for everyone: for maximum effectiveness, set
          up your entire team on Stir.
        </h2>

        <div className="mt-14 flex snap-x gap-6 overflow-x-auto pb-4 lg:flex-col lg:overflow-visible">
          {cards.map((card) => (
            <article
              key={card.number}
              className={`relative w-[85vw] shrink-0 snap-start overflow-hidden rounded-2xl p-6 lg:w-full lg:p-10 ${card.bg}`}
            >
              <span className="absolute top-6 left-4 text-sm text-ink lg:top-10 lg:left-6 [writing-mode:vertical-lr]">
                {card.number} <span className="font-bold">{card.role}</span>
              </span>

              <div className="grid gap-8 pl-6 lg:grid-cols-[450px_1fr] lg:gap-16 lg:pl-10">
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
                  <img src={card.photo} alt={card.name} className="h-full w-full object-cover" />
                  <p className="absolute bottom-6 left-6 text-2xl text-white">{card.name}</p>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="w-fit rounded-full border border-mint px-4 py-1.5 text-xs font-bold text-ink">
                    {card.badge}
                  </span>
                  <p className="mt-8 text-xl font-bold text-ink lg:text-2xl">{card.quote}</p>

                  <div className="mt-10 grid grid-cols-2 gap-y-3 border-t border-white/60 pt-4 text-sm">
                    <span className="font-bold text-ink">Channels</span>
                    <span className="font-bold text-ink">Activity</span>
                    {card.rows.map((row, i) => (
                      <Fragment key={i}>
                        <span className="border-t border-white/60 py-3 text-ink">
                          {row.channel}
                        </span>
                        <span className="border-t border-white/60 py-3 text-ink">
                          {row.activity}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Fragment, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Reveal } from './Reveal'
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

type CardData = (typeof cards)[number]

function CardContent({ card }: { card: CardData }) {
  return (
    <article className={`relative h-full overflow-hidden rounded-2xl p-6 lg:p-10 ${card.bg}`}>
      <span className="absolute top-6 left-4 text-sm text-ink lg:top-10 lg:left-6 [writing-mode:vertical-lr]">
        {card.number} <span className="font-bold">{card.role}</span>
      </span>

      <div className="grid h-full grid-rows-[auto_1fr] gap-8 pl-6 lg:h-auto lg:grid-cols-[450px_1fr] lg:grid-rows-none lg:gap-16 lg:pl-10">
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
          <img
            src={card.photo}
            alt={card.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <p className="absolute bottom-6 left-6 text-2xl text-white">{card.name}</p>
        </div>

        <div className="flex h-full flex-col lg:justify-center">
          <span className="w-fit rounded-full border border-ink/30 px-4 py-1.5 text-xs font-bold text-ink">
            {card.badge}
          </span>
          <p className="mt-8 text-xl font-bold text-ink lg:text-2xl">{card.quote}</p>

          <div className="mt-auto grid grid-cols-2 gap-y-3 border-t border-white/60 pt-4 text-sm lg:mt-10">
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
  )
}

const paginationVars = {
  '--swiper-pagination-color': '#7352ff',
  '--swiper-pagination-bullet-inactive-color': '#babec3',
  '--swiper-pagination-bullet-inactive-opacity': '1',
} as CSSProperties

export function TeamCards() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold text-ink lg:text-[40px] lg:leading-tight">
            We&rsquo;ve got something for everyone: for maximum effectiveness, set
            up your entire team on Stir.
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14 lg:hidden">
        <Swiper
          modules={[Pagination]}
          slidesPerView="auto"
          centeredSlides
          spaceBetween={16}
          pagination={{ clickable: true }}
          style={paginationVars}
          className="pb-10! [&_.swiper-slide]:h-auto! [&_.swiper-wrapper]:items-stretch"
        >
          {cards.map((card) => (
            <SwiperSlide key={card.number} className="w-[85vw]!">
              <CardContent card={card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>

      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <div className="mt-14 hidden lg:flex lg:flex-col lg:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="rounded-2xl transition-shadow duration-300 hover:shadow-2xl"
            >
              <CardContent card={card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

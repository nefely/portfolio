import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import { Reveal } from './Reveal'
import avatarAnna from '../assets/figma/avatar-anna.jpg'
import avatarAirrack from '../assets/figma/avatar-airrack.jpg'
import avatarLiza from '../assets/figma/avatar-liza.jpg'
import avatarPeter from '../assets/figma/avatar-peter.jpg'
import avatarJessica from '../assets/figma/avatar-jessica.jpg'
import {
  InstagramIcon,
  TwitterIcon,
  YoutubeGlyph,
  AnchorGlyph,
} from './icons'

type Person = {
  name: string
  role: string
  photo?: string
  socials: Array<{ icon: ReactNode; bg: string }>
}

const people: Person[] = [
  {
    name: 'Anna',
    role: 'Podcaster',
    photo: avatarAnna,
    socials: [{ icon: <InstagramIcon className="h-3.5 w-3.5" />, bg: '#c13584' }],
  },
  {
    name: 'Airrack',
    role: 'Youtuber',
    photo: avatarAirrack,
    socials: [{ icon: <YoutubeGlyph className="h-4 w-4" />, bg: '#282828' }],
  },
  {
    name: 'Liza Koshy',
    role: 'Creator',
    photo: avatarLiza,
    socials: [
      { icon: <InstagramIcon className="h-3.5 w-3.5" />, bg: '#c13584' },
      { icon: <YoutubeGlyph className="h-4 w-4" />, bg: '#282828' },
      { icon: <TwitterIcon className="h-3.5 w-3.5" />, bg: '#1da1f2' },
    ],
  },
  {
    name: 'Peter Hollens',
    role: 'Musician',
    photo: avatarPeter,
    socials: [
      { icon: <YoutubeGlyph className="h-4 w-4" />, bg: '#282828' },
      { icon: <AnchorGlyph className="h-4 w-4" />, bg: '#009771' },
    ],
  },
  {
    name: 'Jessica',
    role: 'Streamer',
    photo: avatarJessica,
    socials: [
      { icon: <YoutubeGlyph className="h-4 w-4" />, bg: '#282828' },
      { icon: <InstagramIcon className="h-3.5 w-3.5" />, bg: '#c13584' },
    ],
  },
]

function CardContent({ person }: { person: Person }) {
  return (
    <div className="relative">
      <div className="h-[220px] w-[220px] overflow-hidden rounded-2xl bg-line shadow-md transition-shadow duration-300 hover:shadow-xl lg:h-[264px] lg:w-[264px]">
        {person.photo && (
          <img
            src={person.photo}
            alt={person.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          />
        )}
      </div>
      <div className="absolute -top-5 left-4 rounded-md bg-white px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-ink">{person.name}</p>
        <div className="my-1 h-px w-full bg-[#f7f2e4]" />
        <p className="text-[10px] text-ink">{person.role}</p>
      </div>
      <div className="absolute top-6 -right-3 flex flex-col gap-1.5 rounded-md bg-white p-1.5 shadow-lg">
        {person.socials.map((s, i) => (
          <span
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform duration-300 hover:scale-110"
            style={{ background: s.bg }}
          >
            {s.icon}
          </span>
        ))}
      </div>
    </div>
  )
}

function Card({ person, delay }: { person: Person; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="shrink-0"
    >
      <CardContent person={person} />
    </motion.div>
  )
}

const loopPeople = [...people, ...people, ...people]

export function AvatarMarquee() {
  return (
    <section className="py-10 lg:py-12">
      <Reveal className="lg:hidden">
        <Swiper
          modules={[Autoplay]}
          slidesPerView="auto"
          centeredSlides
          spaceBetween={24}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          className="pt-6! pb-2!"
        >
          {loopPeople.map((p, i) => (
            <SwiperSlide key={`${p.name}-${i}`} className="w-55!">
              <CardContent person={p} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>

      <div className="hidden lg:flex lg:w-full lg:justify-center lg:gap-16 lg:px-0">
        {people.map((p, i) => (
          <Card key={p.name} person={p} delay={i * 0.08} />
        ))}
      </div>
    </section>
  )
}

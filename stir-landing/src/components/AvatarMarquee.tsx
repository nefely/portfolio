import type { ReactNode } from 'react'
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
  {
    name: 'Anthony Pompliano',
    role: 'Creator',
    socials: [{ icon: <TwitterIcon className="h-3.5 w-3.5" />, bg: '#1da1f2' }],
  },
]

function Card({ person }: { person: Person }) {
  return (
    <div className="relative shrink-0">
      <div className="h-[220px] w-[220px] overflow-hidden rounded-2xl bg-line lg:h-[264px] lg:w-[264px]">
        {person.photo && (
          <img src={person.photo} alt={person.name} className="h-full w-full object-cover" />
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
            className="flex h-7 w-7 items-center justify-center rounded-full text-white"
            style={{ background: s.bg }}
          >
            {s.icon}
          </span>
        ))}
      </div>
    </div>
  )
}

export function AvatarMarquee() {
  return (
    <section className="overflow-x-auto py-10 lg:overflow-visible lg:py-12">
      <div className="flex w-max gap-10 px-6 lg:w-full lg:justify-center lg:gap-16 lg:px-0">
        {people.map((p) => (
          <Card key={p.name} person={p} />
        ))}
      </div>
    </section>
  )
}

import { useState } from 'react'
import { ChevronIcon } from './icons'
import rhettLink from '../assets/figma/testimonial-rhettlink.jpg'
import casey from '../assets/figma/testimonial-casey.jpg'
import colinSamir from '../assets/figma/testimonial-colinsamir.jpg'
import jackConte from '../assets/figma/testimonial-jackconte.jpg'
import logoAxios from '../assets/figma/logo-axios.png'
import logoInformation from '../assets/figma/logo-theinformation.png'
import logoTubefilter from '../assets/figma/logo-tubefilter.png'

const slides = [
  { name: 'Rhett McLaughlin & Link Neal', role: 'Creators', photo: rhettLink },
  { name: 'Casey Neistat', role: 'Creator', photo: casey },
  { name: 'Colin and Samir', role: 'Creators', photo: colinSamir },
  { name: 'Jack Conte', role: 'CEO of Patreon', photo: jackConte },
]

export function Testimonials() {
  const [index, setIndex] = useState(1)
  const prevIndex = (index - 1 + slides.length) % slides.length
  const nextIndex = (index + 1) % slides.length

  return (
    <section className="bg-ink py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6">
        <h2 className="mx-auto max-w-xl text-center text-2xl text-white lg:text-[40px]">
          Trusted by leaders of the creative community
        </h2>

        <div className="mt-14 flex items-center justify-center gap-4">
          <div className="hidden aspect-video w-1/5 shrink-0 overflow-hidden rounded-sm opacity-60 lg:block">
            <img src={slides[prevIndex].photo} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-sm border border-white">
            <img
              src={slides[index].photo}
              alt={slides[index].name}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-4 left-4 rounded-md bg-white/10 px-2 py-1 text-[10px] text-white">
              Slide {index + 1} of {slides.length}.
            </span>
            <div className="absolute bottom-0 flex w-full items-center gap-4 bg-gradient-to-t from-black/60 to-transparent px-6 py-5">
              <span className="rounded-full border border-mint px-4 py-1.5 text-xs text-white">
                {slides[index].role}
              </span>
              <span className="text-xl text-white lg:text-2xl">{slides[index].name}</span>
            </div>
          </div>

          <div className="hidden aspect-video w-1/5 shrink-0 overflow-hidden rounded-sm opacity-60 lg:block">
            <img src={slides[nextIndex].photo} alt="" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => setIndex(prevIndex)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition hover:bg-white/10"
          >
            <ChevronIcon direction="left" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => setIndex(nextIndex)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition hover:bg-white/10"
          >
            <ChevronIcon direction="right" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-20 text-center">
          <p className="text-xs tracking-widest text-white/70">FEATURED IN</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10 opacity-90">
            <img src={logoAxios} alt="Axios" className="h-6 w-auto" />
            <img src={logoInformation} alt="The Information" className="h-5 w-auto" />
            <img src={logoTubefilter} alt="Tubefilter" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}

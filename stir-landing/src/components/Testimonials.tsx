import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { ChevronIcon } from './icons'
import { Reveal } from './Reveal'
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

// Swiper's loop mode needs enough physical slides to fill the track twice over;
// with centeredSlides + auto-width slides, 4 real slides isn't enough.
const loopSlides = [...slides, ...slides, ...slides]

export function Testimonials() {
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <section className="bg-ink py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6">
        <Reveal>
          <h2 className="mx-auto max-w-xl text-center text-2xl text-white lg:text-[40px]">
            Trusted by leaders of the creative community
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <Swiper
          onSwiper={(s) => {
            swiperRef.current = s
          }}
          loop
          centeredSlides
          slidesPerView="auto"
          spaceBetween={16}
          className="[&_.swiper-slide]:opacity-60 [&_.swiper-slide]:transition-opacity [&_.swiper-slide]:duration-300 [&_.swiper-slide-active]:opacity-100"
        >
          {loopSlides.map((slide, i) => (
            <SwiperSlide key={`${slide.name}-${i}`} className="w-[min(1100px,84vw)]!">
              <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-transparent in-[.swiper-slide-active]:border-white">
                <img src={slide.photo} alt={slide.name} className="h-full w-full object-cover" />
                <span className="absolute top-4 left-4 rounded-md bg-white/10 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity duration-300 in-[.swiper-slide-active]:opacity-100">
                  Slide {(i % slides.length) + 1} of {slides.length}.
                </span>
                <div className="absolute bottom-0 flex w-full items-center gap-4 bg-gradient-to-t from-black/60 to-transparent px-6 py-5 opacity-0 transition-opacity duration-300 in-[.swiper-slide-active]:opacity-100">
                  <span className="rounded-full border border-mint px-4 py-1.5 text-xs text-white">
                    {slide.role}
                  </span>
                  <span className="text-xl text-white lg:text-2xl">{slide.name}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>

      <div className="mx-auto w-full max-w-[1440px] px-6">
        <div className="mt-10 flex justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition-all duration-300 hover:scale-110 hover:bg-white/10 active:scale-95"
          >
            <ChevronIcon direction="left" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition-all duration-300 hover:scale-110 hover:bg-white/10 active:scale-95"
          >
            <ChevronIcon direction="right" className="h-5 w-5" />
          </button>
        </div>

        <Reveal delay={0.1} className="mt-20 text-center">
          <p className="text-xs tracking-widest text-white/70">FEATURED IN</p>
          <div className="mt-6 flex flex-nowrap items-center justify-center gap-4 opacity-90 sm:gap-10">
            <img src={logoAxios} alt="Axios" className="h-4 w-auto shrink-0 grayscale transition-all duration-300 hover:grayscale-0 sm:h-6" />
            <img src={logoInformation} alt="The Information" className="h-3.5 w-auto shrink-0 grayscale transition-all duration-300 hover:grayscale-0 sm:h-5" />
            <img src={logoTubefilter} alt="Tubefilter" className="h-4 w-auto shrink-0 grayscale transition-all duration-300 hover:grayscale-0 sm:h-6" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

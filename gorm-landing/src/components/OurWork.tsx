import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import work1 from "../assets/images/our-work-1.png"
import work2 from "../assets/images/our-work-2.png"
import work3 from "../assets/images/our-work-3.png"

const projects = [
  { title: "Social distancing awareness app", image: work1 },
  { title: "Mars — planet #04", image: work2 },
  { title: "Typography & stationery branding", image: work3 },
]

function OurWork() {
  return (
    <section id="work" className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <h2 className="mb-14 text-center text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-7xl">
          Our work
        </h2>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        rewind
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {projects.map((project) => (
          <SwiperSlide key={project.title}>
            <img
              src={project.image}
              alt={project.title}
              className="aspect-3/4 w-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-0 bg-red py-3 text-center">
        <a
          href="#work"
          className="border-b border-white/50 pb-0.5 text-xs font-semibold uppercase tracking-widest text-white hover:border-white"
        >
          All project
        </a>
      </div>
    </section>
  )
}

export default OurWork

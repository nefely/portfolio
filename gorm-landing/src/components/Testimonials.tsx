import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import ImagePlaceholder from "./ui/ImagePlaceholder"
import avatarJohn from "../assets/images/testemonial-1.png"

const testimonials = [
  {
    quote: "Together with the Görm team, we have compiled a new product page.",
    name: "John Doe",
    role: "Görm customer",
    avatar: avatarJohn,
  },
  {
    quote: "The team understood our brand instantly and shipped ahead of schedule.",
    name: "Jane Smith",
    role: "Görm customer",
    avatar: null,
  },
  {
    quote: "Our conversion rate doubled within a month of the new site going live.",
    name: "Alex Turner",
    role: "Görm customer",
    avatar: null,
  },
]

function Testimonials() {
  return (
    <section className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <h2 className="mb-16 text-center text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-7xl">
          Testimonials
        </h2>

        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="max-w-2xl pb-14!"
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="flex flex-col items-center gap-6 text-center">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label={`avatar-${t.name.toLowerCase().replace(" ", "-")}`}
                    className="h-20 w-20 rounded-full bg-[#e76436]"
                  />
                )}
                <p className="max-w-xl text-2xl font-semibold uppercase leading-snug tracking-tight text-white">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {t.name}
                  <br />
                  {t.role}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default Testimonials

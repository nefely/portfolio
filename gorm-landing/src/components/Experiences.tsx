import iconPrototyping from "../assets/icons/build-icon-1.svg"
import iconWebDesign from "../assets/icons/build-icon-2.svg"
import iconDevelopment from "../assets/icons/build-icon-3.svg"

const services = [
  {
    title: "Prototyping",
    text: "Make sure you're building the right product.",
    icon: iconPrototyping,
  },
  {
    title: "Web design",
    text: "Attract and engage your customers with a website.",
    icon: iconWebDesign,
  },
  {
    title: "Development",
    text: "Ensure your site performs up to your users' standards.",
    icon: iconDevelopment,
  },
]

function Experiences() {
  return (
    <section className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="mb-16 text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-7xl">
          We build experiences
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="overflow-hidden rounded-xl bg-card text-center">
              <div className="flex items-center justify-center bg-white/5 py-12">
                <div className="flex h-30 w-30 items-center justify-center rounded-2xl bg-red p-7">
                  <img src={service.icon} alt="" className="h-full w-full rounded-lg" />
                </div>
              </div>
              <div className="px-8 py-8">
                <h3 className="mb-2 text-lg font-semibold uppercase tracking-wide text-white">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-body">{service.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experiences

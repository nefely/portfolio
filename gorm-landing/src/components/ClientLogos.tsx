import partner1 from "../assets/icons/partner-1.svg"
import partner2 from "../assets/icons/partner-2.svg"
import partner3 from "../assets/icons/partner-3.svg"
import partner4 from "../assets/icons/partner-4.svg"
import partner5 from "../assets/icons/partner-5.svg"
import partner6 from "../assets/icons/partner-6.svg"

const clients = [partner1, partner2, partner3, partner4, partner5, partner6]

function ClientLogos() {
  return (
    <section className="border-b border-white/15 py-20">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-10 px-6 text-center lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Teams and companies we work with
        </p>

        <div className="grid grid-cols-2 items-center gap-x-16 gap-y-10 sm:grid-cols-3">
          {clients.map((logo, i) => (
            <div key={i} className="flex h-16 items-center justify-center">
              <img src={logo} alt="" className="max-h-full max-w-full w-auto" />
            </div>
          ))}
        </div>

        <a
          href="#work"
          className="border-b border-white/40 pb-1 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:border-red hover:text-red"
        >
          View our work
        </a>
      </div>
    </section>
  )
}

export default ClientLogos

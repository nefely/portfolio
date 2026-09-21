import contactImage from "../assets/images/contact.jpg"

function ContactSection() {
  return (
    <section id="contact" className="border-b border-white/15">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        <img
          src={contactImage}
          alt="Görm team member at a desk"
          className="aspect-square w-full object-cover lg:aspect-auto lg:min-h-150"
        />

        <div className="flex flex-col justify-center gap-8 px-6 py-20 lg:px-16">
          <h2 className="text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-6xl">
            Contact us
          </h2>

          <form className="mx-auto flex w-full max-w-lg flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name*"
              required
              className="border border-white/20 bg-card px-5 py-4 text-sm text-white placeholder:text-body focus:border-red focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              required
              className="border border-white/20 bg-card px-5 py-4 text-sm text-white placeholder:text-body focus:border-red focus:outline-none"
            />
            <input
              type="url"
              name="website"
              placeholder="Website URL*"
              required
              className="border border-white/20 bg-card px-5 py-4 text-sm text-white placeholder:text-body focus:border-red focus:outline-none"
            />
            <textarea
              name="details"
              placeholder="Project Details*"
              required
              rows={4}
              className="resize-none border border-white/20 bg-card px-5 py-4 text-sm text-white placeholder:text-body focus:border-red focus:outline-none"
            />
            <button
              type="submit"
              className="mt-2 w-fit rounded bg-red px-6 py-4 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-dark"
            >
              Send proposal
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactSection

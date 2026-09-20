import { Reveal } from './Reveal'

export function WelcomeBanner() {
  return (
    <section className="mx-auto w-full max-w-[1199px] px-6 py-16 text-center lg:px-0 lg:py-20">
      <Reveal>
        <p className="text-lg text-coral lg:text-xl">Welcome to Stir</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mx-auto mt-4 max-w-3xl text-2xl leading-[1.3] font-bold text-ink lg:text-[40px]">
          Our goal is to make every aspect of running your creator business
          simple so you can be creative and change the world.
        </h2>
      </Reveal>
    </section>
  )
}

import { CollectivesIcon } from './icons'
import { Reveal } from './Reveal'
import collectivesMockup from '../assets/figma/collectives-mockup.png'

export function CollectivesFeature() {
  return (
    <section className="bg-ink-soft py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-[#ededed]">
              <CollectivesIcon className="h-4 w-4" />
              Collectives
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-mint lg:text-xl">Co-opportunity Knocks</p>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-white lg:text-[64px]">
              Collectives: The future of collab culture
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-8 text-lg text-white">Coming later this year</p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-14 overflow-hidden rounded-2xl shadow-[0_0_240px_rgba(25,25,25,0.7)]">
          <img
            src={collectivesMockup}
            alt="Stir Collectives dashboard"
            className="w-full transition-transform duration-500 hover:scale-105"
          />
        </Reveal>
      </div>
    </section>
  )
}

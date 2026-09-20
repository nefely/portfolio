import { CheckIcon } from './icons'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import securityBg from '../assets/figma/security-matrix-bg.png'

const points = [
  'We will never (ever) share your data',
  'Secured by TLS (SSL) 256-bit bank-level encryption',
  'We’re a multi-creator network, not an MCN',
]

export function Security() {
  return (
    <section className="relative overflow-hidden bg-ink py-16 lg:py-24">
      <img
        src={securityBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[44%] object-cover opacity-70 lg:block"
      />
      <div className="relative mx-auto flex w-full max-w-[1199px] justify-end px-6 lg:px-0">
        <div className="max-w-lg text-left">
          <Reveal>
            <p className="text-lg text-coral lg:text-xl">Serious about security</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 text-2xl text-white lg:text-[40px] lg:leading-tight">
              Our top priority is keeping your data safe and secure.
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 flex flex-col gap-5">
            {points.map((point) => (
              <RevealItem key={point}>
                <div className="flex items-center gap-3 text-base text-white transition-transform duration-300 hover:translate-x-1 lg:text-xl">
                  <CheckIcon className="h-4 w-4 shrink-0 text-coral" />
                  {point}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}

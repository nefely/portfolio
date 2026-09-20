import { PayIcon, ArrowRightIcon } from './icons'
import { Reveal, RevealGroup, RevealItem } from './Reveal'
import payFee from '../assets/figma/pay-fee-mockup.png'
import pay1099 from '../assets/figma/pay-1099-mockup.png'
import bankNotification from '../assets/figma/bank-notification-mockup.png'
import payImessage from '../assets/figma/pay-imessage-mockup.png'

const cards = [
  {
    title: 'Never pay a fee again',
    body: 'Send and receive for free. Keep the 2.9% and reinvest it back into your business.',
    image: payFee,
  },
  {
    title: 'Put your 1099’s on autopilot',
    body: 'We’ll automate your paperwork so tax time is simple, like it should be.',
    image: pay1099,
  },
  {
    title: 'Bank-to-bank in literally seconds',
    body: 'Stir deposits money instantly into your accounts. Never wait 3-5 business days again.',
    image: bankNotification,
  },
  {
    title: 'Wherever you do business',
    body: 'iMessage, Instagram, or even Discord - Pay meets you wherever you need it.',
    image: payImessage,
  },
]

const comingSoon = [
  'Brand partnerships',
  'Content linking',
  'Public payment profiles',
  'Scheduled payments',
  'Batch sends',
  'Send via DM',
]

export function PayFeature() {
  return (
    <section className="bg-ink py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-bold text-ink-soft">
              <PayIcon className="h-4 w-4" />
              Pay
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-mint lg:text-xl">Free. Instant. Professional.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="mt-4 text-3xl text-white lg:text-[64px]">Payments built for creators.</h2>
          </Reveal>
        </div>

        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <RevealItem key={card.title}>
              <div className="group h-full overflow-hidden rounded-2xl bg-[#1d1d1d] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:bg-[#242424] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <p className="text-lg text-mint">{card.title}</p>
                <p className="mt-3 max-w-md text-sm text-white/80">{card.body}</p>
                <div className="mt-8 flex justify-center overflow-hidden">
                  <img
                    src={card.image}
                    alt=""
                    className="max-h-[340px] w-auto max-w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-2">
          <Reveal>
            <h3 className="max-w-xs text-2xl text-white lg:text-[40px] lg:leading-tight">
              And we&rsquo;re just getting started
            </h3>
            <a href="#careers" className="group mt-6 inline-flex items-center gap-2 text-lg text-mint">
              Come work with us
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-2xl text-white">Coming soon</p>
            <RevealGroup className="mt-4">
              {comingSoon.map((item) => (
                <RevealItem key={item}>
                  <p className="border-t border-white/10 py-4 text-xl text-white transition-colors duration-300 first:border-t-0 hover:text-mint">
                    {item}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

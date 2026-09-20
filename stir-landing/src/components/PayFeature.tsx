import { PayIcon, ArrowRightIcon } from './icons'
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
          <span className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-bold text-ink-soft">
            <PayIcon className="h-4 w-4" />
            Pay
          </span>
          <p className="mt-6 text-lg text-mint lg:text-xl">Free. Instant. Professional.</p>
          <h2 className="mt-4 text-3xl text-white lg:text-[64px]">Payments built for creators.</h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <div key={card.title} className="overflow-hidden rounded-2xl bg-[#1d1d1d] p-8">
              <p className="text-lg text-mint">{card.title}</p>
              <p className="mt-3 max-w-md text-sm text-white/80">{card.body}</p>
              <div className="mt-8 flex justify-center">
                <img src={card.image} alt="" className="max-h-[340px] w-auto max-w-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-2">
          <div>
            <h3 className="max-w-xs text-2xl text-white lg:text-[40px] lg:leading-tight">
              And we&rsquo;re just getting started
            </h3>
            <a href="#careers" className="mt-6 inline-flex items-center gap-2 text-lg text-mint">
              Come work with us
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
          <div>
            <p className="text-2xl text-white">Coming soon</p>
            <ul className="mt-4">
              {comingSoon.map((item) => (
                <li key={item} className="border-t border-white/10 py-4 text-xl text-white first:border-t-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

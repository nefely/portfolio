import dropPresubscribe from '../assets/figma/drop-presubscribe.jpg'
import dropOnlyTweets from '../assets/figma/drop-onlytweets.jpg'
import dropMerchWith from '../assets/figma/drop-merchwith.jpg'

const drops = [
  { title: 'Presubscribe', photo: dropPresubscribe, caption: undefined },
  { title: 'Only Tweets', photo: dropOnlyTweets, caption: undefined },
  {
    title: 'MerchWith',
    photo: dropMerchWith,
    caption: 'Merch collabs by creators who never met',
  },
]

export function Drops() {
  return (
    <section className="bg-ink py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1199px] px-6 lg:px-0">
        <span className="inline-flex items-center rounded-full border border-mint px-4 py-1.5 text-xs font-bold text-white">
          Drops
        </span>
        <h2 className="mt-6 text-3xl text-white lg:text-[64px]">We&rsquo;re creators too</h2>
        <p className="mt-6 max-w-xl text-lg text-white lg:text-xl">
          Occasionally, we produce one-off projects that are in pursuit of our
          mission of enabling creators to run great businesses, own their
          content, and build a direct relationship with their audience.
        </p>
        <form
          className="mt-8 w-full max-w-[360px] rounded-full border border-white"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full bg-transparent px-6 py-4 text-white outline-none placeholder:text-white"
          />
        </form>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop) => (
            <figure key={drop.title} className="relative">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src={drop.photo} alt={drop.title} className="h-full w-full object-cover" />
                <div className="absolute inset-4 border border-white/70" />
                <figcaption className="absolute inset-x-0 bottom-10 text-center text-4xl text-white">
                  {drop.title}
                </figcaption>
              </div>
              {drop.caption && (
                <p className="mt-3 text-center text-xs text-white/80">{drop.caption}</p>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

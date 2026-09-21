import blog1 from "../assets/images/blog-1.png"
import blog2 from "../assets/images/blog-2.png"
import Reveal from "./ui/Reveal"
import RevealGroup, { RevealItem } from "./ui/RevealGroup"

const posts = [
  {
    tag: "Marketing",
    tagClass: "bg-[#ff5fa2]",
    title: "Curating a workplace that inspires all of us",
    image: blog1,
  },
  {
    tag: "Design",
    tagClass: "bg-[#ff5c4d]",
    title: "Designers who changed the web with Webflow",
    image: blog2,
  },
]

function Blog() {
  return (
    <section className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Reveal>
          <h2 className="mb-14 text-center text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-7xl">
            From blog
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <RevealItem key={post.title}>
              <article className="group">
                <div className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="bg-card p-6">
                  <span
                    className={`inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${post.tagClass}`}
                  >
                    {post.tag}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold uppercase leading-snug tracking-tight text-white">
                    {post.title}
                  </h3>
                  <a
                    href="#blog"
                    className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-white/70 transition-colors group-hover:text-red"
                  >
                    Read more
                  </a>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

export default Blog

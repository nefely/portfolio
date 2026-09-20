import { useLoaderData } from 'react-router'
import ArticlesGrid from './../components/ArticlesGrid'
import ShowMoreButton from '../components/ShowMoreButton'
import { usePagination } from '../lib/usePagination'
import type { Article } from '../types'

export default function MainPage() {
    const articles = useLoaderData() as Article[]
    const hotNews = articles.filter((article) => article.isHot)
    const allNews = articles.filter((article) => !article.isHot)
    const { visible, hasMore, showMore } = usePagination(allNews)

    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase mb-8 inline-block bg-black text-white px-3 py-1 -rotate-1">
            News
          </h1>

          {hotNews.length > 0 && (
            <section className="mb-12 bg-yellow-300 brutal-border brutal-shadow p-6">
              <h2 className="font-display text-2xl font-extrabold uppercase mb-4">🔥 Hot News</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotNews.map((article) => (
                  <ArticlesGrid article={article} key={article.id} />
                ))}
              </div>
            </section>
          )}

          <h2 className="font-display text-2xl font-extrabold uppercase mb-4">🌐 All News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visible.map((article) => (
                <ArticlesGrid article={article} key={article.id} />
              ))}
          </div>

          {hasMore && <ShowMoreButton onClick={showMore} />}
        </div>
    )
}

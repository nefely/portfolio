import ArticlesGrid from './../components/ArticlesGrid'
import { allArticles } from '../data/articles'

const hotNews = allArticles.filter((article) => article.isHot)
const allNews = allArticles.filter((article) => !article.isHot)

export default function MainPage() {
    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-6">News</h1>

          {hotNews.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">🔥 Hot News</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotNews.map((article) => (
                  <ArticlesGrid article={article} key={article.id} />
                ))}
              </div>
            </section>
          )}

          <h2 className="text-2xl font-bold mb-4">🌐 All News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allNews.map((article) => (
                <ArticlesGrid article={article} key={article.id} />
              ))}
          </div>
        </div>
    )
}
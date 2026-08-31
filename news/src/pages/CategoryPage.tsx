import { useParams, Link } from 'react-router'
import { allArticles } from '../data/articles'
import ArticlesGrid from '../components/ArticlesGrid'

export default function CategoryPage() {
    const { category } = useParams<{ category: string }>()
    const articles = allArticles.filter((a) => a.category === category)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{category}</h1>

            {articles.length === 0 ? (
                <p className="text-lg text-gray-700">
                    No articles in this category yet.{' '}
                    <Link to="/" className="text-blue-600 underline">Back to home</Link>
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {articles.map((article) => (
                        <ArticlesGrid article={article} key={article.id} />
                    ))}
                </div>
            )}
        </div>
    )
}

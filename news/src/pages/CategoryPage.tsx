import { useParams, useLoaderData, Link } from 'react-router'
import ArticlesGrid from '../components/ArticlesGrid'
import ShowMoreButton from '../components/ShowMoreButton'
import { usePagination } from '../lib/usePagination'
import type { Article } from '../types'

export default function CategoryPage() {
    const { category } = useParams<{ category: string }>()
    const articles = useLoaderData() as Article[]
    const { visible, hasMore, showMore } = usePagination(articles)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase mb-8 inline-block bg-black text-white px-3 py-1 -rotate-1">
                {category}
            </h1>

            {articles.length === 0 ? (
                <p className="text-lg text-gray-700">
                    No articles in this category yet.{' '}
                    <Link to="/" className="underline font-bold">Back to home</Link>
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visible.map((article) => (
                            <ArticlesGrid article={article} key={article.id} />
                        ))}
                    </div>
                    {hasMore && <ShowMoreButton onClick={showMore} />}
                </>
            )}
        </div>
    )
}

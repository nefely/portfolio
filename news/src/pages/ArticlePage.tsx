import { useParams, Link } from 'react-router'
import { allArticles } from '../data/articles'
import Article from '../components/Article'

export default function ArticlePage() {
    const { slug } = useParams<{ slug: string }>()
    const article = allArticles.find((a) => a.slug === slug)

    if (!article) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-lg text-gray-700">Article not found.</p>
                <Link to="/" className="text-blue-600 underline">Back to home</Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Article article={article} />
        </div>
    )
}

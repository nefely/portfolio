import { useParams, useLocation, Link } from 'react-router'
import Article from '../components/Article'
import type { Article as ArticleType } from '../types'

export default function ArticlePage() {
    const { slug } = useParams<{ slug: string }>()
    const location = useLocation()
    const article = location.state as ArticleType | undefined

    if (!article) {
        const originalLink = slug ? decodeURIComponent(slug) : null

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="brutal-border brutal-shadow bg-white p-6 max-w-xl">
                    <p className="text-lg text-gray-800 mb-4">
                        We only keep article details in memory while you're browsing, so this page can't be reloaded directly.
                    </p>
                    {originalLink && (
                        <a href={originalLink} target="_blank" rel="noreferrer" className="underline font-bold">
                            Open the original article →
                        </a>
                    )}
                    <div className="mt-4">
                        <Link to="/" className="underline font-bold">Back to home</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Article article={article} />
        </div>
    )
}

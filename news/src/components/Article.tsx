import type { Article as ArticleType } from '../types'

export default function Article({ article }: { article: ArticleType }) {
    return (
        <>
            {article.image && (
                <img src={article.image} alt={article.title} className="w-full h-64 object-cover brutal-border brutal-shadow mb-6" />
            )}
            <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{article.title}</h1>
            <p className="text-sm font-bold uppercase text-gray-600 mb-6">{article.category} · {article.source} · {article.date}</p>
            <p className="text-lg text-gray-800 mb-8">{article.excerpt}</p>
            <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-3 brutal-border brutal-shadow brutal-press bg-yellow-300 font-extrabold uppercase"
            >
                Read full article on {article.source} →
            </a>
        </>
    )
}

import { Link, useNavigate } from 'react-router'
import type { Article } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
    Technology: 'bg-yellow-300',
    Development: 'bg-lime-300',
    Cybersecurity: 'bg-red-400',
    Science: 'bg-cyan-300',
    Design: 'bg-pink-400',
}

const DEFAULT_CATEGORY_COLOR = 'bg-gray-300'
const CARD_EXCERPT_LENGTH = 100

function truncate(text: string, length: number): string {
    return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text
}

export default function ArticlesGrid({ article }: { article: Article }) {
    const navigate = useNavigate()
    const categoryColor = CATEGORY_COLORS[article.category] ?? DEFAULT_CATEGORY_COLOR

    const handleCategoryClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        navigate(`/category/${article.category}`)
    }

    return (
        <Link
            to={`/article/${article.slug}`}
            state={article}
            key={article.id}
            className="bg-white flex flex-col brutal-border brutal-shadow brutal-press overflow-hidden"
        >
            {article.image ? (
                <img src={article.image} alt={article.title} className="w-full h-48 object-cover border-b-[3px] border-black" />
            ) : (
                <div className="w-full h-48 border-b-[3px] border-black bg-[repeating-linear-gradient(45deg,#000,#000_2px,transparent_2px,transparent_10px)] opacity-10" />
            )}
            <div className="p-5 pb-6 flex flex-col h-full">
                <h2 className="font-display text-xl font-bold mb-2 leading-snug">{article.title}</h2>
                <p className="text-gray-700 mb-4 text-sm">{truncate(article.excerpt, CARD_EXCERPT_LENGTH)}</p>
                <div className="flex mt-auto justify-between items-center gap-3 text-xs">
                    <span
                        onClick={handleCategoryClick}
                        className={`px-2 py-1 brutal-border font-extrabold uppercase cursor-pointer ${categoryColor}`}
                    >
                        {article.category}
                    </span>
                    <span className="font-bold text-gray-600 text-right">{article.source} · {article.date}</span>
                </div>
            </div>
        </Link>
    )
}

import { Link, useNavigate } from 'react-router'
import type { Article } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
    Technology: 'bg-blue-100 text-blue-700',
    Development: 'bg-purple-100 text-purple-700',
    Education: 'bg-amber-100 text-amber-700',
    Community: 'bg-pink-100 text-pink-700',
    Cybersecurity: 'bg-red-100 text-red-700',
    Science: 'bg-cyan-100 text-cyan-700',
    Medicine: 'bg-emerald-100 text-emerald-700',
    Energy: 'bg-orange-100 text-orange-700',
}

const DEFAULT_CATEGORY_COLOR = 'bg-gray-100 text-gray-700'

export default function ArticlesGrid({ article }: { article: Article }) {
    const navigate = useNavigate()
    const categoryColor = CATEGORY_COLORS[article.category] ?? DEFAULT_CATEGORY_COLOR

    const handleCategoryClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        navigate(`/category/${article.category}`)
    }

    return (
        <Link to={`/article/${article.slug}`} key={article.id} className="bg-white flex flex-col rounded-lg shadow-md overflow-hidden">
            {article.image && (
            <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-600 mb-4 ">{article.excerpt}</p>
            <div className="flex mt-auto justify-between items-center text-sm text-gray-500">
                <span
                    onClick={handleCategoryClick}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${categoryColor}`}
                >
                    {article.category}
                </span>
                <span>{article.date}</span>
            </div>
            </div>
        </Link>
    )
}

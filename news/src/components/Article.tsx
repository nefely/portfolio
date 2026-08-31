import type { Article as ArticleType } from '../types'

export default function Article({ article }: { article: ArticleType }) {
    console.log(article)
    return (
        <>  
            <div>
                <img src={article.image} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />    
            </div> 
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <p className="text-sm text-gray-500 mb-6">{article.category} · {article.date}</p>
            {article.content.map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-700 mb-4">
                    {paragraph}
                </p>
            ))}
        </>
    )
}

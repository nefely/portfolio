import { createBrowserRouter } from 'react-router'
import RootLayout from './layouts/RootLayout'
import MainPage from './pages/MainPage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'
import { getAllArticles, getArticlesByCategory } from './lib/rss'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <MainPage />, loader: () => getAllArticles() },
            { path: 'article/:slug', element: <ArticlePage /> },
            {
                path: 'category/:category',
                element: <CategoryPage />,
                loader: ({ params }) => getArticlesByCategory(params.category!),
            },
        ],
    },
])

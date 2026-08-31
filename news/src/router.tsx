import { createBrowserRouter } from 'react-router'
import RootLayout from './layouts/RootLayout'
import MainPage from './pages/MainPage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <MainPage /> },
            { path: 'article/:slug', element: <ArticlePage /> },
            { path: 'category/:category', element: <CategoryPage /> },
        ],
    },
])

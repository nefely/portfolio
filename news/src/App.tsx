import { Routes, Route } from 'react-router'
import MainPage from './pages/MainPage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/article/:slug" element={<ArticlePage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
    </Routes>
  )
}

export default App

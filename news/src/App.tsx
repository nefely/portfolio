import { Routes, Route } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import MainPage from './pages/MainPage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

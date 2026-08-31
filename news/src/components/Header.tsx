import { useState } from 'react'
import { Link } from 'react-router'
import { CATEGORIES } from '../data/categories'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-xl font-bold text-gray-900"
                    >
                        <span>
                            News<span className="text-blue-600">Hub</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category}
                                to={`/category/${category}`}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                {category}
                            </Link>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {isMenuOpen && (
                    <nav className="md:hidden flex flex-col gap-1 pb-4">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category}
                                to={`/category/${category}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                            >
                                {category}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    )
}

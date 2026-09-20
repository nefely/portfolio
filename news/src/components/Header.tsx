import { useState } from 'react'
import { Link } from 'react-router'
import { CATEGORIES } from '../lib/feeds'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-[#f5f1e8] border-b-[3px] border-black">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="font-display flex items-center gap-2 text-2xl font-extrabold uppercase tracking-tight text-black"
                    >
                        <span className="bg-yellow-300 brutal-border px-2 py-0.5">News</span>
                        <span>Hub</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category}
                                to={`/category/${category}`}
                                className="text-sm font-bold uppercase px-3 py-1.5 border-[2px] border-transparent hover:border-black hover:bg-white transition-colors"
                            >
                                {category}
                            </Link>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        className="md:hidden inline-flex items-center justify-center w-10 h-10 brutal-border bg-white brutal-press"
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
                    <nav className="md:hidden flex flex-col gap-2 pb-4">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category}
                                to={`/category/${category}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 py-2 brutal-border bg-white text-sm font-bold uppercase"
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

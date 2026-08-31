import { Link } from 'react-router'
import { CATEGORIES } from '../data/categories'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 text-gray-300 mt-16">
            <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
                        <span>
                            News<span className="text-blue-400">Hub</span>
                        </span>
                    </Link>
                    <p className="mt-3 text-sm text-gray-400">
                        Fresh takes on technology, science and the world of software — updated daily.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Categories</h3>
                    <ul className="space-y-2 text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                        {CATEGORIES.map((category) => (
                            <li key={category}>
                                <Link to={`/category/${category}`} className="hover:text-white transition-colors">
                                    {category}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">About</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-4 text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
                    <span>© {year} NewsHub. All rights reserved.</span>
                    <span>Built with React &amp; Tailwind CSS</span>
                </div>
            </div>
        </footer>
    )
}

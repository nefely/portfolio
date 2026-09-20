import { Link } from 'react-router'
import { CATEGORIES } from '../lib/feeds'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-black text-white mt-16 border-t-[3px] border-black">
            <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                    <Link to="/" className="font-display flex items-center gap-2 text-xl font-extrabold uppercase">
                        <span className="bg-yellow-300 text-black brutal-border px-2 py-0.5">News</span>
                        <span>Hub</span>
                    </Link>
                    <p className="mt-3 text-sm text-gray-300">
                        Fresh takes on technology, science and the world of software — updated daily.
                    </p>
                </div>

                <div>
                    <h3 className="font-display text-sm font-extrabold uppercase tracking-wide mb-3 text-yellow-300">Categories</h3>
                    <ul className="space-y-2 text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                        {CATEGORIES.map((category) => (
                            <li key={category}>
                                <Link to={`/category/${category}`} className="hover:text-yellow-300 transition-colors font-bold">
                                    {category}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-display text-sm font-extrabold uppercase tracking-wide mb-3 text-yellow-300">About</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/" className="hover:text-yellow-300 transition-colors font-bold">Home</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t-[3px] border-white/20">
                <div className="container mx-auto px-4 py-4 text-sm text-gray-400 flex flex-col sm:flex-row justify-between gap-2">
                    <span>© {year} NewsHub. All rights reserved.</span>
                    <span>Built with React &amp; Tailwind CSS</span>
                </div>
            </div>
        </footer>
    )
}

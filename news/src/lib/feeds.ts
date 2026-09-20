export interface FeedSource {
    category: string
    source: string
    url: string
}

// One feed per category — real content, no backend needed. Add more sources
// per category later if you want variety within a single category.
export const FEEDS: FeedSource[] = [
    { category: 'Technology', source: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { category: 'Development', source: 'Dev.to', url: 'https://dev.to/feed' },
    { category: 'Cybersecurity', source: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
    { category: 'Science', source: 'NASA', url: 'https://www.nasa.gov/news-release/feed/' },
    { category: 'Design', source: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/' },
]

export const CATEGORIES = FEEDS.map((feed) => feed.category)

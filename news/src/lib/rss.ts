import type { Article } from '../types'
import { FEEDS, type FeedSource } from './feeds'

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json'
const EXCERPT_LENGTH = 200
const HOT_COUNT = 4

interface RSS2JsonItem {
    title: string
    link: string
    guid: string
    pubDate: string
    description: string
    content: string
    thumbnail: string
    enclosure?: { link?: string }
}

interface RSS2JsonResponse {
    status: string
    items: RSS2JsonItem[]
}

function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function toExcerpt(html: string): string {
    const text = stripHtml(html)
    return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text
}

function firstImageFrom(html: string): string | undefined {
    const match = html.match(/<img[^>]+src="([^"]+)"/i)
    return match?.[1]
}

function formatDate(pubDate: string): string {
    const parsed = new Date(pubDate)
    if (Number.isNaN(parsed.getTime())) return pubDate
    return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function toArticle(item: RSS2JsonItem, feed: FeedSource): Article {
    return {
        id: item.guid || item.link,
        slug: encodeURIComponent(item.link),
        title: item.title,
        excerpt: toExcerpt(item.description || item.content),
        category: feed.category,
        date: formatDate(item.pubDate),
        image: item.thumbnail || item.enclosure?.link || firstImageFrom(item.content) || undefined,
        link: item.link,
        source: feed.source,
    }
}

async function fetchFeed(feed: FeedSource): Promise<Article[]> {
    const apiKey = import.meta.env.VITE_RSS2JSON_API_KEY
    const params = new URLSearchParams({ rss_url: feed.url })
    if (apiKey) params.set('api_key', apiKey)

    const response = await fetch(`${RSS2JSON_ENDPOINT}?${params}`)
    const data = (await response.json()) as RSS2JsonResponse

    if (data.status !== 'ok') {
        throw new Error(`Failed to load feed "${feed.source}"`)
    }

    return data.items.map((item) => toArticle(item, feed))
}

function byDateDesc(a: Article, b: Article): number {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
}

function withHotFlag(articles: Article[]): Article[] {
    const hotIds = new Set(articles.slice(0, HOT_COUNT).map((a) => a.id))
    return articles.map((article) => ({ ...article, isHot: hotIds.has(article.id) }))
}

export async function getAllArticles(): Promise<Article[]> {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed))
    const articles = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    return withHotFlag(articles.sort(byDateDesc))
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
    const feed = FEEDS.find((f) => f.category === category)
    if (!feed) return []
    const articles = await fetchFeed(feed)
    return articles.sort(byDateDesc)
}

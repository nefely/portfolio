export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  image?: string
  link: string
  source: string
  isHot?: boolean
}

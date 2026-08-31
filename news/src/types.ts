export interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string[]
  category: string
  date: string
  image?: string
  isHot?: boolean
}

import { useMemo, useState } from 'react'

const PAGE_SIZE = 8

export function usePagination<T>(items: T[]) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])
    const hasMore = visibleCount < items.length

    return {
        visible,
        hasMore,
        showMore: () => setVisibleCount((count) => count + PAGE_SIZE),
    }
}

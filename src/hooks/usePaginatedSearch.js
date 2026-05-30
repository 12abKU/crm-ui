import { useCallback, useEffect, useRef, useState } from 'react'
import { listCache, getCachePrefix, isFresh, LIST_TTL } from '../utils/cacheUtils'

export default function usePaginatedSearch({ pageSize, fetchPage, cacheKey, initialPage = 0 }) {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(initialPage)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const didMount = useRef(false)

    const loadPage = useCallback(async (pageNum, q = '', extra) => {
        const prefix = `${getCachePrefix()}:${cacheKey}`
        const key = `${prefix}:${pageNum}:${q}:${JSON.stringify(extra || {})}`

        const cached = listCache.get(key)
        const fresh = isFresh(cached, LIST_TTL)

        if (cached) {
            setItems(cached.value.content)
            setTotalPages(cached.value.totalPages)
            setTotalElements(cached.value.totalElements)
        }

        if (fresh) {
            return // Skip network call since cache is fresh
        }

        if (!cached) {
            setLoading(true)
        }

        try {
            const data = await fetchPage({ page: pageNum, size: pageSize, search: q, extra })
            const result = {
                content: data.content ?? [],
                totalPages: data.totalPages ?? 0,
                totalElements: data.totalElements ?? 0
            }
            listCache.set(key, { value: result, cachedAt: Date.now() })
            setItems(result.content)
            setTotalPages(result.totalPages)
            setTotalElements(result.totalElements)
        } finally {
            setLoading(false)
        }
    }, [fetchPage, pageSize, cacheKey])

    useEffect(() => {
        loadPage(initialPage, '')
    }, [loadPage, initialPage])

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }

        // Invalidate all page cache entries for this cacheKey prefix on search text change
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const key of listCache.keys()) {
            if (key.startsWith(prefix)) {
                listCache.delete(key)
            }
        }

        const timer = setTimeout(() => {
            setPage(0)
            loadPage(0, search)
        }, 350)
        return () => clearTimeout(timer)
    }, [search, loadPage, cacheKey])

    const goToPage = (nextPage, extra) => {
        setPage(nextPage)
        loadPage(nextPage, search, extra)
    }

    const reloadCurrentPage = (extra) => {
        const prefix = `${getCachePrefix()}:${cacheKey}`
        const key = `${prefix}:${page}:${search}:${JSON.stringify(extra || {})}`
        listCache.delete(key)
        return loadPage(page, search, extra)
    }

    const updateItemInCache = useCallback((predicate, updater) => {
        // 1. Update React state
        setItems(prev => prev.map(item => predicate(item) ? updater(item) : item))
        
        // 2. Update listCache entries for this prefix
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const [key, cached] of listCache.entries()) {
            if (key.startsWith(prefix)) {
                const updatedContent = cached.value.content.map(item => 
                     predicate(item) ? updater(item) : item
                )
                listCache.set(key, {
                    ...cached,
                    value: {
                        ...cached.value,
                        content: updatedContent
                    }
                })
            }
        }
    }, [cacheKey])

    return {
        items,
        setItems,
        page,
        setPage,
        totalPages,
        totalElements,
        loading,
        search,
        setSearch,
        loadPage,
        goToPage,
        reloadCurrentPage,
        updateItemInCache,
    }
}

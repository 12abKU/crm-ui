import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api'
import { listCache, listCacheSet, getCachePrefix, isFresh, LIST_TTL } from '../utils/cacheUtils'

/**
 * usePaginatedSearch
 *
 * Stable paginated-search hook supporting multi-column server sorting.
 *
 * @param {string}   baseUrl
 * @param {number}   pageSize
 * @param {string}   cacheKey
 * @param {number}   [initialPage=0]
 * @param {string[]} [initialSort=[]] - Array of "field,asc" | "field,desc"
 */
export default function usePaginatedSearch({ baseUrl, pageSize, cacheKey, initialPage = 0, initialSort = [] }) {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(initialPage)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState(initialSort)

    const didMountSearch = useRef(false)
    const didMountSort = useRef(false)

    const baseUrlRef = useRef(baseUrl)
    useEffect(() => { baseUrlRef.current = baseUrl }, [baseUrl])

    const sortRef = useRef(sort)
    useEffect(() => { sortRef.current = sort }, [sort])

    const invalidateCacheForKey = useCallback(() => {
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const key of listCache.keys()) {
            if (key.startsWith(prefix)) listCache.delete(key)
        }
    }, [cacheKey])

    const loadPage = useCallback(async (pageNum, q = '', sortOverride = null) => {
        const url = baseUrlRef.current
        if (!url) return

        const activeSort = Array.isArray(sortOverride) ? sortOverride : sortRef.current
        const sortKeyStr = activeSort.join('|')
        const prefix = `${getCachePrefix()}:${cacheKey}`
        const key    = `${prefix}:${pageNum}:${q}:${sortKeyStr}`

        const cached = listCache.get(key)
        const fresh  = isFresh(cached, LIST_TTL)

        if (cached) {
            setItems(cached.value.content)
            setTotalPages(cached.value.totalPages)
            setTotalElements(cached.value.totalElements)
        }

        if (fresh) return

        if (!cached) setLoading(true)

        try {
            const separator = url.includes('?') ? '&' : '?'
            const params    = new URLSearchParams({ page: pageNum, size: pageSize })
            if (q.trim()) params.set('search', q.trim())
            activeSort.forEach(s => { if (s) params.append('sort', s) })
            const finalUrl = `${url}${separator}${params}`

            const r      = await api.get(finalUrl)
            const data   = r.data
            const result = {
                content:       data.content       ?? [],
                totalPages:    data.totalPages     ?? 0,
                totalElements: data.totalElements  ?? 0,
            }

            listCacheSet(key, result)
            setItems(result.content)
            setTotalPages(result.totalPages)
            setTotalElements(result.totalElements)
        } finally {
            setLoading(false)
        }
    }, [cacheKey, pageSize])

    // Initial load
    useEffect(() => {
        loadPage(initialPage, '', initialSort)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadPage, initialPage])

    // Re-fetch when baseUrl changes
    const prevBaseUrl = useRef(baseUrl)
    useEffect(() => {
        if (prevBaseUrl.current === baseUrl) return
        prevBaseUrl.current = baseUrl
        invalidateCacheForKey()
        setPage(0)
        loadPage(0, search)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl])

    // Search debounce
    useEffect(() => {
        if (!didMountSearch.current) { didMountSearch.current = true; return }
        invalidateCacheForKey()
        const timer = setTimeout(() => {
            setPage(0)
            loadPage(0, search)
        }, 350)
        return () => clearTimeout(timer)
    }, [search, loadPage, invalidateCacheForKey])

    // Sort change triggers immediate reload on page 0
    useEffect(() => {
        if (!didMountSort.current) { didMountSort.current = true; return }
        invalidateCacheForKey()
        setPage(0)
        loadPage(0, search, sort)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort])

    const toggleSort = useCallback((field, isMulti = false) => {
        setSort(prev => {
            const existingIdx = prev.findIndex(entry => entry.split(',')[0] === field)
            if (!isMulti) {
                if (existingIdx === -1) return [`${field},asc`]
                const currentDir = prev[existingIdx].split(',')[1] || 'asc'
                if (currentDir === 'asc') return [`${field},desc`]
                return prev.length > 1 ? [`${field},asc`] : []
            }
            const next = [...prev]
            if (existingIdx === -1) {
                next.push(`${field},asc`)
            } else {
                const currentDir = next[existingIdx].split(',')[1] || 'asc'
                if (currentDir === 'asc') next[existingIdx] = `${field},desc`
                else next.splice(existingIdx, 1)
            }
            return next
        })
    }, [])

    const goToPage = (nextPage) => {
        setPage(nextPage)
        loadPage(nextPage, search)
    }

    const reloadCurrentPage = () => {
        invalidateCacheForKey()
        return loadPage(page, search)
    }

    const updateItemInCache = useCallback((predicate, updater) => {
        setItems(prev => prev.map(item => predicate(item) ? updater(item) : item))

        const prefix = `${getCachePrefix()}:${cacheKey}:`
        const targets = []
        for (const [key, cached] of listCache.entries()) {
            if (key.startsWith(prefix)) {
                targets.push({ key, cached })
            }
        }
        for (const { key, cached } of targets) {
            const updatedContent = cached.value.content.map(item =>
                predicate(item) ? updater(item) : item
            )
            listCacheSet(key, { ...cached.value, content: updatedContent })
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
        sort,
        setSort,
        toggleSort,
        loadPage,
        goToPage,
        reloadCurrentPage,
        invalidateCacheForKey,
        updateItemInCache,
    }
}

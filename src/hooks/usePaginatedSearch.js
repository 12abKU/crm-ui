import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api'
import { listCache, getCachePrefix, isFresh, LIST_TTL } from '../utils/cacheUtils'

/**
 * usePaginatedSearch
 *
 * Stable paginated-search hook — the API call lives INSIDE the hook so callers
 * never pass an unstable `fetchPage` function reference that would cause
 * dependency-chain re-renders and infinite request loops.
 *
 * @param {string}  baseUrl      - The API endpoint prefix, e.g. "/api/accounts"
 *                                 Query params (page, size, search) are appended
 *                                 automatically.  Any *extra* fixed params
 *                                 (e.g. accountId filter) should be baked in here.
 * @param {number}  pageSize     - Items per page (stable number).
 * @param {string}  cacheKey     - Logical cache namespace, e.g. "accounts".
 * @param {number}  [initialPage=0]
 */
export default function usePaginatedSearch({ baseUrl, pageSize, cacheKey, initialPage = 0 }) {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(initialPage)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    // Track first mount so the search-debounce effect skips its initial run
    const didMount = useRef(false)

    // Keep a ref to the latest baseUrl so the loadPage callback never
    // needs baseUrl in its own dependency array (avoids re-creation when
    // the caller rebuilds the URL string on every render).
    const baseUrlRef = useRef(baseUrl)
    useEffect(() => { baseUrlRef.current = baseUrl }, [baseUrl])

    const loadPage = useCallback(async (pageNum, q = '') => {
        const url = baseUrlRef.current
        if (!url) return

        const prefix = `${getCachePrefix()}:${cacheKey}`
        const key    = `${prefix}:${pageNum}:${q}`

        const cached = listCache.get(key)
        const fresh  = isFresh(cached, LIST_TTL)

        // Show cached data immediately (stale-while-revalidate)
        if (cached) {
            setItems(cached.value.content)
            setTotalPages(cached.value.totalPages)
            setTotalElements(cached.value.totalElements)
        }

        if (fresh) return // Cache is fresh — skip network

        if (!cached) setLoading(true)

        try {
            // Build final URL — append page/size/search to whatever baseUrl has
            const separator = url.includes('?') ? '&' : '?'
            const params    = new URLSearchParams({ page: pageNum, size: pageSize })
            if (q.trim()) params.set('search', q.trim())
            const finalUrl = `${url}${separator}${params}`

            const r      = await api.get(finalUrl)
            const data   = r.data
            const result = {
                content:       data.content       ?? [],
                totalPages:    data.totalPages     ?? 0,
                totalElements: data.totalElements  ?? 0,
            }

            listCache.set(key, { value: result, cachedAt: Date.now() })
            setItems(result.content)
            setTotalPages(result.totalPages)
            setTotalElements(result.totalElements)
        } finally {
            setLoading(false)
        }
    }, [cacheKey, pageSize]) // ← stable deps only; baseUrl is read via ref

    // ── Initial load ─────────────────────────────────────────────
    useEffect(() => {
        loadPage(initialPage, '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadPage, initialPage])

    // ── Re-fetch when baseUrl changes (e.g. filterAccountId toggle) ──
    // We watch baseUrl directly in a separate effect so the reload is explicit
    // and not tangled with loadPage's own dependency chain.
    const prevBaseUrl = useRef(baseUrl)
    useEffect(() => {
        if (prevBaseUrl.current === baseUrl) return  // no change
        prevBaseUrl.current = baseUrl

        // Invalidate all cache entries for this cacheKey
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const key of listCache.keys()) {
            if (key.startsWith(prefix)) listCache.delete(key)
        }

        setPage(0)
        loadPage(0, search)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl]) // intentionally narrow — only re-run when the URL string itself changes

    // ── Search debounce ─────────────────────────────────────────
    useEffect(() => {
        if (!didMount.current) { didMount.current = true; return }

        // Invalidate all page cache entries for this cacheKey prefix on search change
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const key of listCache.keys()) {
            if (key.startsWith(prefix)) listCache.delete(key)
        }

        const timer = setTimeout(() => {
            setPage(0)
            loadPage(0, search)
        }, 350)
        return () => clearTimeout(timer)
    }, [search, loadPage, cacheKey])

    // ── Public helpers ───────────────────────────────────────────
    const goToPage = (nextPage) => {
        setPage(nextPage)
        loadPage(nextPage, search)
    }

    const reloadCurrentPage = () => {
        const prefix = `${getCachePrefix()}:${cacheKey}`
        const key    = `${prefix}:${page}:${search}`
        listCache.delete(key)
        return loadPage(page, search)
    }

    const invalidateCacheForKey = useCallback(() => {
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const key of listCache.keys()) {
            if (key.startsWith(prefix)) listCache.delete(key)
        }
    }, [cacheKey])

    const updateItemInCache = useCallback((predicate, updater) => {
        // 1. Update React state
        setItems(prev => prev.map(item => predicate(item) ? updater(item) : item))

        // 2. Update all matching listCache entries for this cacheKey prefix
        const prefix = `${getCachePrefix()}:${cacheKey}:`
        for (const [key, cached] of listCache.entries()) {
            if (key.startsWith(prefix)) {
                const updatedContent = cached.value.content.map(item =>
                    predicate(item) ? updater(item) : item
                )
                listCache.set(key, {
                    ...cached,
                    value: { ...cached.value, content: updatedContent }
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
        invalidateCacheForKey,
        updateItemInCache,
    }
}

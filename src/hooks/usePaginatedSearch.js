import { useCallback, useEffect, useRef, useState } from 'react'

export default function usePaginatedSearch({ pageSize, fetchPage, initialPage = 0 }) {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(initialPage)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const didMount = useRef(false)

    const loadPage = useCallback(async (pageNum, q = '', extra) => {
        setLoading(true)
        try {
            const data = await fetchPage({ page: pageNum, size: pageSize, search: q, extra })
            setItems(data.content ?? [])
            setTotalPages(data.totalPages ?? 0)
            setTotalElements(data.totalElements ?? 0)
        } finally {
            setLoading(false)
        }
    }, [fetchPage, pageSize])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPage(initialPage, '')
    }, [loadPage, initialPage])

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        const timer = setTimeout(() => {
            setPage(0)
            loadPage(0, search)
        }, 350)
        return () => clearTimeout(timer)
    }, [search, loadPage])

    const goToPage = (nextPage, extra) => {
        setPage(nextPage)
        loadPage(nextPage, search, extra)
    }

    const reloadCurrentPage = (extra) => loadPage(page, search, extra)

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
    }
}

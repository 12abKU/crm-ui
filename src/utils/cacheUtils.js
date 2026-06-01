export const LIST_TTL = 2 * 60 * 1000      // 2 minutes
export const PROFILE_TTL = 5 * 60 * 1000   // 5 minutes
export const LIST_CACHE_MAX_ENTRIES = 200

// Global Map caches
export const listCache = new Map()
export const profileCache = new Map()

export const getCachePrefix = () => {
    const companyId = localStorage.getItem('companyId') || 'none'
    const userId = localStorage.getItem('userId') || 'none'
    return `${companyId}:${userId}`
}

export const isFresh = (entry, ttlMs) => {
    if (!entry || !entry.cachedAt) return false
    return (Date.now() - entry.cachedAt) < ttlMs
}

const trimListCache = () => {
    while (listCache.size > LIST_CACHE_MAX_ENTRIES) {
        const oldestKey = listCache.keys().next().value
        listCache.delete(oldestKey)
    }
}

export const listCacheSet = (key, value) => {
    if (listCache.has(key)) listCache.delete(key)
    listCache.set(key, { value, cachedAt: Date.now() })
    trimListCache()
}

// Simple LRU helper for profile cache (size 10 limit)
export const profileCacheGet = (key) => {
    if (!profileCache.has(key)) return undefined
    const entry = profileCache.get(key)
    profileCache.delete(key)
    profileCache.set(key, entry)
    return entry.value
}

export const profileCacheSet = (key, value) => {
    if (profileCache.has(key)) profileCache.delete(key)
    profileCache.set(key, { value, cachedAt: Date.now() })
    if (profileCache.size > 10) {
        profileCache.delete(profileCache.keys().next().value)
    }
}

export const clearAllCaches = () => {
    listCache.clear()
    profileCache.clear()
}

/** ISO date (YYYY-MM-DD) for calendar API range params */
export const toIsoDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

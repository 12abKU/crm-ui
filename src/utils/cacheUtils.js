export const LIST_TTL = 2 * 60 * 1000      // 2 minutes
export const PROFILE_TTL = 5 * 60 * 1000   // 5 minutes

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

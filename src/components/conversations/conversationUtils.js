export const timeAgo = (str) => {
    if (!str) return '—'
    const date = new Date(str)
    if (isNaN(date)) return str
    const hours = Math.floor((Date.now() - date) / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Yesterday' : `${days}d ago`
}

export const decodeHtml = (str) => {
    if (!str) return ''
    return str
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
}

export const timeAgo = (str) => {
    if (!str) return 'No value'
    const hours = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Yesterday' : `${days} days ago`
}

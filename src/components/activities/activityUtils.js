export const OUTCOMES = {
    CALL: ['Answered', 'No answer', 'Left voicemail', 'Wrong number'],
    EMAIL: ['Replied', 'No reply', 'Bounced', 'Out of office'],
    MEETING: ['Completed', 'No show', 'Rescheduled', 'Cancelled'],
    NOTE: ['Noted'],
}

export const getStatus = (scheduledAt, completed) => {
    if (completed) return 'done'
    if (!scheduledAt) return 'logged'
    const diff = new Date(scheduledAt) - new Date()
    const hours = diff / 3600000
    if (diff < 0) return 'overdue'
    if (hours < 24) return 'today'
    return 'upcoming'
}

export const STATUS_STYLES = {
    done: { label: 'Done', bg: 'rgba(22,163,74,0.10)', color: '#16A34A' },
    overdue: { label: 'Overdue', bg: 'rgba(220,38,38,0.10)', color: '#DC2626' },
    today: { label: 'Due today', bg: 'rgba(217,119,6,0.12)', color: '#D97706' },
    upcoming: { label: 'Upcoming', bg: 'rgba(22,163,74,0.10)', color: '#16A34A' },
    logged: { label: 'Logged', bg: 'rgba(120,113,108,0.12)', color: '#78716C' },
}

export const fmtScheduled = (s) => {
    if (!s) return '—'
    const d = new Date(s)
    const now = new Date()
    const diffDays = Math.floor((d - now) / 86400000)
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 0) return `Today ${time}`
    if (diffDays === 1) return `Tomorrow ${time}`
    if (diffDays === -1) return `Yesterday ${time}`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + time
}

export const fmtTimelineGroup = (dateStr) => {
    if (!dateStr) return 'No date'
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'long' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

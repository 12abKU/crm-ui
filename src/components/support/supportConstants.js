import { T } from '../../constants/theme'

export const PRIORITY_STYLES = {
    LOW:    { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'Low' },
    MEDIUM: { bg: 'rgba(217,119,6,0.12)',   color: '#D97706', label: 'Medium' },
    HIGH:   { bg: 'rgba(220,38,38,0.12)',   color: '#DC2626', label: 'High' },
    URGENT: { bg: 'rgba(220,38,38,0.18)',   color: '#991B1B', label: 'Urgent' },
}

export const STATUS_STYLES = {
    OPEN:        { bg: T.primaryDim,              color: T.primary,  label: 'Open' },
    IN_PROGRESS: { bg: 'rgba(217,119,6,0.12)',    color: '#D97706',  label: 'In Progress' },
    RESOLVED:    { bg: 'rgba(22,163,74,0.12)',     color: '#16A34A',  label: 'Resolved' },
    CLOSED:      { bg: 'rgba(100,116,139,0.12)',   color: '#64748B',  label: 'Closed' },
}

export const CATEGORY_ICONS = {
    BILLING:         'payments',
    TECHNICAL:       'build',
    FEATURE_REQUEST: 'lightbulb',
    BUG_REPORT:      'bug_report',
    ACCOUNT:         'manage_accounts',
    OTHER:           'help',
}

export const EMPTY_FORM = { subject: '', description: '', category: '', priority: 'MEDIUM' }

export const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'Yesterday' : `${d} days ago`
}
import { T } from '../../constants/theme'

export const STATUS_STYLES = {
    ACTIVE:    { bg: 'rgba(22,163,74,0.10)',   color: '#16a34a' },
    SUSPENDED: { bg: 'rgba(220,38,38,0.10)',   color: '#DC2626' },
    TRIAL:     { bg: 'rgba(217,119,6,0.10)',   color: '#D97706' },
}

export const PLAN_STYLES = {
    FREE:       { bg: 'rgba(120,113,108,0.10)', color: '#78716c' },
    PRO:        { bg: T.primaryDim,             color: T.primary },
    ENTERPRISE: { bg: T.superAdminFaint,        color: T.superAdminColor },
}

export const ROLE_STYLES = {
    SUPER_ADMIN: {
        bg: T.superAdminDim,
        color: T.superAdminColor,
        border: '1px solid transparent',
        label: 'Super Admin',
        badge: '👑',
        hasCrown: true,
    },
    COMPANY_SUPER_ADMIN: {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        label: 'Company Super Admin',
        badge: '👑',
        hasCrown: true,
    },
    ADMIN: { bg: T.primaryDim,              color: T.primary, label: 'Admin' },
    AGENT: { bg: 'rgba(22,163,74,0.10)',    color: '#16a34a', label: 'Agent' },
}

export const COMPANY_ROLES = ['COMPANY_SUPER_ADMIN', 'ADMIN', 'AGENT']

export const COMPANY_ROLE_OPTIONS = [
    { value: 'COMPANY_SUPER_ADMIN', label: 'Company Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'AGENT', label: 'Agent' },
]

export function daysLeft(trialEndsAt) {
    if (!trialEndsAt) return null
    return Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
}
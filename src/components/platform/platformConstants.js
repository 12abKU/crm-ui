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
    ADMIN: { bg: T.primaryDim,              color: T.primary },
    AGENT: { bg: 'rgba(22,163,74,0.10)',    color: '#16a34a' },
}

export function daysLeft(trialEndsAt) {
    if (!trialEndsAt) return null
    return Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
}
import { T, getThemeName } from '../../constants/theme'

const isDark = () => getThemeName() === 'dark'

export const DASHBOARD_ACCENTS = {
    blue: '#38BDF8',
    teal: '#2DD4BF',
    gold: '#F59E0B',
    rose: '#FB7185',
    green: '#10B981',
    red: '#F87171',
    violet: '#A78BFA',
    indigo: '#818CF8',
}

export const luxeShadow = (accent = T.primary, lifted = false) => (
    isDark()
        ? `${lifted ? '0 20px 40px -8px' : '0 10px 24px -4px'} rgba(0,0,0,0.55), 0 0 0 1px ${accent}25`
        : `${lifted ? '0 14px 28px -4px' : '0 4px 16px -2px'} rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(0,0,0,0.04)`
)

export const luxeSurface = (accent = T.primary) => ({
    background: isDark()
        ? `linear-gradient(180deg, ${T.surface} 0%, ${T.surfaceRaised} 100%)`
        : '#FFFFFF',
    border: isDark()
        ? '1px solid rgba(255, 255, 255, 0.08)'
        : `1px solid ${T.border}`,
    boxShadow: luxeShadow(accent),
})

export const dashboardRowBg = () => (
    isDark() ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.72)'
)

export const dashboardPanelBg = () => (
    isDark() ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.48)'
)

export const tableSurface = {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
}

export const fmt = (v) => Number(v || 0).toLocaleString('en-IN')

export const fmtK = (v) => {
    const n = Number(v || 0)
    if (n >= 100000) return `\u20B9${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `\u20B9${(n / 1000).toFixed(1)}K`
    return `\u20B9${fmt(n)}`
}

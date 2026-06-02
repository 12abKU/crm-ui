import { T } from '../../constants/theme'

const isDark = () => T.bg === '#0A0D16'

export const DASHBOARD_ACCENTS = {
    blue: '#2563EB',
    teal: '#0F766E',
    gold: '#D97706',
    rose: '#DB2777',
    green: '#16A34A',
    red: '#DC2626',
    violet: '#7C3AED',
}

export const luxeShadow = (accent = T.primary, lifted = false) => (
    isDark()
        ? `${lifted ? '0 22px 52px' : '0 16px 40px'} rgba(0,0,0,0.34), 0 0 0 1px ${accent}10`
        : `${lifted ? '0 22px 48px' : '0 14px 34px'} rgba(28,18,10,0.08), 0 1px 0 rgba(255,255,255,0.72)`
)

export const luxeSurface = (accent = T.primary) => ({
    background: isDark()
        ? `linear-gradient(145deg, ${T.surfaceRaised} 0%, ${T.surface} 58%, rgba(255,255,255,0.02) 100%)`
        : `linear-gradient(145deg, #FFFFFF 0%, ${T.surface} 58%, ${T.primaryFaint} 100%)`,
    border: `1px solid ${T.border}80`,
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

import Skeleton from 'react-loading-skeleton'
import { T } from '../../constants/theme'

// Icon → accent color mapping for visual variety
const ICON_COLORS = {
    handshake: { bg: T.primaryDim, color: T.chartBlue },
    payments:  { bg: 'rgba(22,163,74,0.12)',  color: '#16A34A' },
    business:  { bg: 'rgba(217,119,6,0.12)',  color: '#D97706' },
    groups:    { bg: 'rgba(83,141,141,0.14)', color: T.chartTeal },
    person_add:{ bg: 'rgba(219,39,119,0.12)', color: T.chartPink },
    task_alt:  { bg: T.primaryDim,  color: T.chartBlue },
}

export default function DashboardStatCard({ icon, label, value, sub, loading }) {
    const accent = ICON_COLORS[icon] || { bg: T.primaryDim, color: T.primary }

    return (
        <div
            className="rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200"
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.09)`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            }}
        >
            {/* Icon + label row */}
            <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: accent.bg }}>
                    <span className="material-symbols-outlined filled text-[22px]"
                        style={{ color: accent.color }}>{icon}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: accent.bg, color: accent.color }}>
                    {sub}
                </span>
            </div>

            {/* Value */}
            {loading
                ? <Skeleton height={36} width={110} borderRadius={8} />
                : <h3 className="text-3xl font-black leading-none" style={{ color: T.textPrimary }}>{value}</h3>
            }

            {/* Label */}
            <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>

            {/* Accent bottom bar */}
            <div className="h-1 rounded-full -mx-6 -mb-6 mt-1"
                style={{ background: `linear-gradient(90deg, ${accent.color}40, transparent)` }} />
        </div>
    )
}

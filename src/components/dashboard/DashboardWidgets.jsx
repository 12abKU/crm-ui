import { T, ACTIVITY_STYLES } from '../../constants/theme'
import DashboardStatCard from './DashboardStatCard'

export function TabSkeleton() {
    return (
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: T.surfaceHigh }} />
            ))}
        </div>
    )
}

export function Card({ children, className = '', style = {} }) {
    return (
        <div className={`rounded-2xl p-6 ${className}`}
            style={{ background: T.surface, border: `1px solid ${T.border}`, ...style }}>
            {children}
        </div>
    )
}

export function CardTitle({ children, icon }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            {icon && <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>{icon}</span>}
            <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>{children}</h3>
        </div>
    )
}

export function StatBox({ label, value, icon, color }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color ? `${color}15` : T.primaryDim }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: color || T.primary }}>{icon}</span>
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value ?? '—'}</p>
            </div>
        </div>
    )
}

export function Empty() {
    return <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No data available</p>
}

export function RecentActivityList({ activities, loading }) {
    if (loading) return [1, 2, 3].map(i => (
        <div key={i} className="h-12 rounded-xl mb-2 animate-pulse" style={{ background: T.surfaceHigh }} />
    ))
    if (!activities?.length) return <Empty />
    return activities.map((a, i) => {
        const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
        return (
            <div key={a.id} className="flex items-center gap-3 py-3 px-3 rounded-xl mb-1"
                style={{ background: i % 2 === 0 ? T.surfaceHigh : 'transparent' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <span className="material-symbols-outlined text-[15px]" style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{a.subject}</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>
                        {[a.accountName, a.contactName].filter(Boolean).join(' · ')}
                    </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: s.bg, color: s.color }}>{a.type}</span>
            </div>
        )
    })
}

export const fmt = (v) => Number(v || 0).toLocaleString('en-IN')
export const fmtK = (v) => {
    const n = Number(v || 0)
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${fmt(n)}`
}
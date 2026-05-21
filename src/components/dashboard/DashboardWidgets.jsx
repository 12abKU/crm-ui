import { T, ACTIVITY_STYLES } from '../../constants/theme'
import DashboardStatCard from './DashboardStatCard'

// ── TabSkeleton ────────────────────────────────────────────────
export function TabSkeleton() {
    return (
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: T.surfaceHigh }} />
            ))}
        </div>
    )
}

// ── Card ───────────────────────────────────────────────────────
export function Card({ children, className = '', style = {} }) {
    return (
        <div className={`rounded-2xl p-6 ${className}`}
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                ...style,
            }}>
            {children}
        </div>
    )
}

// ── CardTitle ──────────────────────────────────────────────────
export function CardTitle({ children, icon }) {
    return (
        <div className="flex items-center gap-2.5 mb-5 pb-4"
            style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
            {icon && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: T.primaryDim }}>
                    <span className="material-symbols-outlined filled text-[15px]"
                        style={{ color: T.primary }}>{icon}</span>
                </div>
            )}
            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>{children}</h3>
        </div>
    )
}

// ── StatBox ────────────────────────────────────────────────────
export function StatBox({ label, value, icon, color }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200"
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color ? `${color}15` : T.primaryDim }}>
                <span className="material-symbols-outlined filled text-[22px]"
                    style={{ color: color || T.primary }}>{icon}</span>
            </div>
            <div>
                <p className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: T.textMuted }}>{label}</p>
                <p className="text-2xl font-black mt-0.5"
                    style={{ color: T.textPrimary }}>{value ?? '—'}</p>
            </div>
        </div>
    )
}

// ── Empty ──────────────────────────────────────────────────────
export function Empty() {
    return (
        <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: T.surfaceHigh }}>
                <span className="material-symbols-outlined text-[20px]"
                    style={{ color: T.textMuted }}>inbox</span>
            </div>
            <p className="text-sm font-medium" style={{ color: T.textMuted }}>No data available</p>
        </div>
    )
}

// ── RecentActivityList (used inside Admin SummaryTab) ──────────
export function RecentActivityList({ activities, loading }) {
    if (loading) return (
        <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: T.surfaceHigh }} />
            ))}
        </div>
    )
    if (!activities?.length) return <Empty />

    return (
        <div className="flex flex-col gap-1">
            {activities.map((a, i) => {
                const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                return (
                    <div key={a.id}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors"
                        style={{ background: i % 2 === 0 ? T.borderSubtle : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.borderSubtle : 'transparent'}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: s.bg }}>
                            <span className="material-symbols-outlined filled text-[14px]"
                                style={{ color: s.color }}>{s.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{a.subject}</p>
                            <p className="text-xs" style={{ color: T.textMuted }}>
                                {[a.accountName, a.contactName].filter(Boolean).join(' · ')}
                            </p>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0"
                            style={{ background: s.bg, color: s.color }}>{a.type}</span>
                    </div>
                )
            })}
        </div>
    )
}

// ── Format utilities (unchanged) ───────────────────────────────
export const fmt = (v) => Number(v || 0).toLocaleString('en-IN')
export const fmtK = (v) => {
    const n = Number(v || 0)
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${fmt(n)}`
}
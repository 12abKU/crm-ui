import { T, ACTIVITY_STYLES } from '../../constants/theme'
import { dashboardPanelBg, dashboardRowBg, luxeShadow, luxeSurface } from './dashboardDesign'

export function TabSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 animate-pulse relative overflow-hidden"
                    style={{
                        borderRadius: 22,
                        ...luxeSurface(T.primary),
                        background: `linear-gradient(110deg, ${T.surface} 8%, ${T.surfaceHigh} 18%, ${T.surface} 32%)`,
                        backgroundSize: '200% 100%',
                    }} />
            ))}
        </div>
    )
}

export function Card({ children, className = '', style = {}, accent = T.primary, compact = false }) {
    return (
        <div className={`relative overflow-hidden transition-all duration-300 ${compact ? 'p-4' : 'p-5 md:p-6'} ${className}`}
            style={{
                borderRadius: 22,
                ...luxeSurface(accent),
                ...style,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = luxeShadow(accent, true)
                e.currentTarget.style.borderColor = `${accent}55`
                e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = luxeShadow(accent)
                e.currentTarget.style.borderColor = `${T.border}80`
                e.currentTarget.style.transform = 'translateY(0)'
            }}>
            <div className="absolute left-0 right-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${accent}E6 0%, ${accent}55 42%, transparent 100%)` }} />
            {children}
        </div>
    )
}

export function CardTitle({ children, icon, accent = T.primary, meta }) {
    return (
        <div className="flex items-center justify-between gap-4 mb-6 pb-4"
            style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
            <div className="flex items-center gap-3 min-w-0">
                {icon && (
                    <div className="w-9 h-9 flex items-center justify-center shrink-0"
                        style={{
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${accent}1A 0%, ${accent}08 100%)`,
                            border: `1px solid ${accent}30`,
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.42)',
                        }}>
                        <span className="material-symbols-outlined filled text-[17px]"
                            style={{ color: accent }}>{icon}</span>
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-sm font-black uppercase truncate"
                        style={{ color: T.textPrimary, letterSpacing: '0.08em' }}>
                        {children}
                    </h3>
                    <div className="mt-1 h-[2px] w-10 rounded-full"
                        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                </div>
            </div>
            {meta && (
                <span className="text-[11px] font-black px-3 py-1 rounded-full shrink-0"
                    style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}22` }}>
                    {meta}
                </span>
            )}
        </div>
    )
}

export function StatBox({ label, value, icon, color }) {
    const iconColor = color || T.primary
    const iconBg = color ? `${color}0D` : T.primaryDim

    return (
        <div className="p-5 flex items-center gap-4 transition-all duration-300 relative overflow-hidden"
            style={{
                borderRadius: 20,
                ...luxeSurface(iconColor),
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = luxeShadow(iconColor, true)
                e.currentTarget.style.borderColor = `${iconColor}45`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = luxeShadow(iconColor)
                e.currentTarget.style.borderColor = `${T.border}80`
            }}>
            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                style={{ background: `linear-gradient(180deg, ${iconColor}, ${iconColor}35)` }} />
            <div className="w-12 h-12 flex items-center justify-center shrink-0"
                style={{
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${iconBg} 0%, ${iconColor}18 100%)`,
                    border: `1px solid ${iconColor}30`,
                    boxShadow: `0 10px 20px ${iconColor}12`,
                }}>
                <span className="material-symbols-outlined filled text-[20px]"
                    style={{ color: iconColor }}>{icon}</span>
            </div>
            <div className="z-10 min-w-0">
                <p className="text-[10px] font-black uppercase truncate"
                    style={{ color: T.textMuted, letterSpacing: '0.1em' }}>{label}</p>
                <p className="text-2xl font-black mt-1 truncate"
                    style={{ color: T.textPrimary }}>{value ?? '-'}</p>
            </div>
        </div>
    )
}

export function MetricPill({ label, value, color = T.primary }) {
    return (
        <div className="px-3 py-2 rounded-xl"
            style={{
                background: `${color}10`,
                border: `1px solid ${color}22`,
            }}>
            <p className="text-[10px] font-black uppercase"
                style={{ color: T.textMuted, letterSpacing: '0.08em' }}>{label}</p>
            <p className="text-sm font-black mt-0.5" style={{ color }}>{value}</p>
        </div>
    )
}

export function TableCard({ children, className = '', style = {} }) {
    return (
        <div className={`overflow-auto rounded-2xl p-2 ${className}`}
            style={{
                background: dashboardPanelBg(),
                border: `1px solid ${T.borderSubtle}`,
                ...style,
            }}>
            {children}
        </div>
    )
}

export function TableHeaderCell({ children }) {
    return (
        <th className="text-left py-3 px-4 text-[10px] font-black uppercase whitespace-nowrap"
            style={{ color: T.textMuted, letterSpacing: '0.09em' }}>
            {children}
        </th>
    )
}

export function TableRow({ children, onClick }) {
    return (
        <tr className={onClick ? 'cursor-pointer transition-all duration-150' : 'transition-all duration-150'}
            style={{
                background: dashboardRowBg(),
                boxShadow: `0 1px 0 ${T.borderSubtle}`,
            }}
            onClick={onClick}
            onMouseEnter={e => {
                e.currentTarget.style.background = T.primaryFaint
                e.currentTarget.style.transform = onClick ? 'translateX(2px)' : 'none'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = dashboardRowBg()
                e.currentTarget.style.transform = 'none'
            }}>
            {children}
        </tr>
    )
}

export function TableCell({ children, className = '', style = {} }) {
    return (
        <td className={`py-3 px-4 align-middle ${className}`}
            style={{
                color: T.textSecondary,
                borderTop: `1px solid ${T.borderSubtle}`,
                borderBottom: `1px solid ${T.borderSubtle}`,
                ...style,
            }}>
            {children}
        </td>
    )
}

export function Empty() {
    return (
        <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-11 h-11 flex items-center justify-center"
                style={{
                    borderRadius: 14,
                    background: T.primaryFaint,
                    border: `1px solid ${T.borderSubtle}`,
                }}>
                <span className="material-symbols-outlined text-[21px]"
                    style={{ color: T.textMuted }}>inbox</span>
            </div>
            <p className="text-sm font-bold" style={{ color: T.textMuted }}>No data available</p>
        </div>
    )
}

export function RecentActivityList({ activities, loading }) {
    if (loading) return (
        <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-13 rounded-xl animate-pulse" style={{ background: T.surfaceHigh }} />
            ))}
        </div>
    )

    if (!activities?.length) return <Empty />

    return (
        <div className="flex flex-col gap-2">
            {activities.map((a) => {
                const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                return (
                    <div key={a.id}
                        className="flex items-center gap-3 py-3 px-3 rounded-2xl transition-all duration-150"
                        style={{
                            background: dashboardRowBg(),
                            border: `1px solid ${T.borderSubtle}`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = T.primaryFaint
                            e.currentTarget.style.borderColor = `${s.color}35`
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = dashboardRowBg()
                            e.currentTarget.style.borderColor = T.borderSubtle
                        }}>
                        <div className="w-9 h-9 flex items-center justify-center shrink-0"
                            style={{ borderRadius: 12, background: s.bg, border: `1px solid ${s.color}20` }}>
                            <span className="material-symbols-outlined filled text-[15px]"
                                style={{ color: s.color }}>{s.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>{a.subject}</p>
                            <p className="text-xs truncate" style={{ color: T.textMuted }}>
                                {[a.accountName, a.contactName].filter(Boolean).join(' / ')}
                            </p>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-black shrink-0"
                            style={{ background: s.bg, color: s.color }}>{a.type}</span>
                    </div>
                )
            })}
        </div>
    )
}

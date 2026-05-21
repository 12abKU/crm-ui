import { T } from '../../../constants/theme'
import { Card, CardTitle, Empty, TabSkeleton, fmt, fmtK } from '../DashboardWidgets'

// Props: data, onAgentClick  (unchanged — onAgentClick navigates to /team/:id)
export default function TeamTab({ data, onAgentClick }) {
    if (!data) return <TabSkeleton />
    const agents = data.agents || []

    return (
        <Card>
            <CardTitle icon="people">Agent Performance</CardTitle>
            {agents.length ? (
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                                {['Agent', 'Role', 'Won', 'Active', 'Revenue Won', 'Open Pipeline', 'Activities', 'Contacts', ''].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black uppercase tracking-widest"
                                        style={{ color: T.textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((a, i) => (
                                <tr key={a.id}
                                    className="cursor-pointer transition-all duration-150"
                                    style={{ borderBottom: `1px solid ${T.borderSubtle}` }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = T.primaryFaint
                                        e.currentTarget.style.transform = 'translateX(2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.transform = 'none'
                                    }}
                                    onClick={() => onAgentClick(a.id)}>

                                    {/* Agent name + avatar */}
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                                                style={{ background: T.primary, color: '#fff' }}>
                                                {a.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm" style={{ color: T.textPrimary }}>{a.name}</p>
                                                <p className="text-xs" style={{ color: T.textMuted }}>{a.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role badge */}
                                    <td className="py-3 px-3">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                            style={{ background: T.primaryDim, color: T.primaryText }}>{a.role}</span>
                                    </td>

                                    {/* Stats */}
                                    <td className="py-3 px-3 font-black" style={{ color: T.success }}>{fmt(a.dealsWon)}</td>
                                    <td className="py-3 px-3 font-semibold" style={{ color: T.textPrimary }}>{fmt(a.activeDeals)}</td>
                                    <td className="py-3 px-3 font-semibold" style={{ color: T.textPrimary }}>{fmtK(a.revenueWon)}</td>
                                    <td className="py-3 px-3" style={{ color: T.textMuted }}>{fmtK(a.openRevenue)}</td>
                                    <td className="py-3 px-3">
                                        <span style={{ color: T.textPrimary, fontWeight: 700 }}>{fmt(a.completedActivities)}</span>
                                        <span style={{ color: T.textMuted }}>/{fmt(a.totalActivities)}</span>
                                    </td>
                                    <td className="py-3 px-3 font-semibold" style={{ color: T.textPrimary }}>{fmt(a.contacts)}</td>

                                    {/* Arrow */}
                                    <td className="py-3 px-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                            style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined text-[14px]"
                                                style={{ color: T.primary }}>arrow_forward</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <Empty />}
        </Card>
    )
}
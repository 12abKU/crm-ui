import { T } from '../../../constants/theme'
import { Card, CardTitle, Empty, TabSkeleton, fmt, fmtK } from '../DashboardWidgets'

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
                                    <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wider"
                                        style={{ color: T.textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((a, i) => (
                                <tr key={a.id} className="cursor-pointer transition-colors"
                                    style={{ background: i % 2 === 0 ? T.surfaceHigh : 'transparent' }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.primaryDim}
                                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.surfaceHigh : 'transparent'}
                                    onClick={() => onAgentClick(a.id)}>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                                style={{ background: T.primaryDim, color: T.primary }}>
                                                {a.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold" style={{ color: T.textPrimary }}>{a.name}</p>
                                                <p className="text-xs" style={{ color: T.textMuted }}>{a.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                            style={{ background: T.primaryDim, color: T.primaryText }}>{a.role}</span>
                                    </td>
                                    <td className="py-3 px-3 font-bold" style={{ color: T.success }}>{fmt(a.dealsWon)}</td>
                                    <td className="py-3 px-3" style={{ color: T.textPrimary }}>{fmt(a.activeDeals)}</td>
                                    <td className="py-3 px-3 font-semibold" style={{ color: T.textPrimary }}>{fmtK(a.revenueWon)}</td>
                                    <td className="py-3 px-3" style={{ color: T.textMuted }}>{fmtK(a.openRevenue)}</td>
                                    <td className="py-3 px-3">
                                        <span style={{ color: T.textPrimary }}>{fmt(a.completedActivities)}</span>
                                        <span style={{ color: T.textMuted }}>/{fmt(a.totalActivities)}</span>
                                    </td>
                                    <td className="py-3 px-3" style={{ color: T.textPrimary }}>{fmt(a.contacts)}</td>
                                    <td className="py-3 px-3">
                                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>arrow_forward</span>
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
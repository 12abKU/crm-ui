import { T } from '../../../constants/theme'
import {
    Card,
    CardTitle,
    Empty,
    TabSkeleton,
    TableCard,
    TableCell,
    TableHeaderCell,
    TableRow,
} from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt, fmtK, tableSurface } from '../dashboardDesign'

export default function TeamTab({ data, onAgentClick }) {
    if (!data) return <TabSkeleton />
    const agents = data.agents || []
    const firstCell = { color: T.textPrimary, borderLeft: `1px solid ${T.borderSubtle}`, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }
    const lastCell = { borderRight: `1px solid ${T.borderSubtle}`, borderTopRightRadius: 14, borderBottomRightRadius: 14 }

    return (
        <Card accent={DASHBOARD_ACCENTS.violet}>
            <CardTitle icon="people" accent={DASHBOARD_ACCENTS.violet} >
                Team Performance
            </CardTitle>
            {agents.length ? (
                <TableCard>
                    <table className="w-full text-sm" style={tableSurface}>
                        <thead>
                            <tr>
                                {['Agent', 'Role', 'Won', 'Active', 'Revenue Won', 'Open Pipeline', 'Activities', 'Contacts', ''].map(h => (
                                    <TableHeaderCell key={h}>{h}</TableHeaderCell>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((a) => (
                                <TableRow key={a.id} onClick={() => onAgentClick(a.id)}>
                                    <TableCell style={firstCell}>
                                        <div className="flex items-center gap-3 min-w-[230px]">
                                            <div className="w-10 h-10 flex items-center justify-center font-black text-sm shrink-0"
                                                style={{
                                                    borderRadius: 14,
                                                    background: `linear-gradient(135deg, ${T.primary}, ${DASHBOARD_ACCENTS.gold})`,
                                                    color: '#fff',
                                                    boxShadow: `0 10px 20px ${T.primary}24`,
                                                }}>
                                                {a.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm truncate" style={{ color: T.textPrimary }}>{a.name}</p>
                                                <p className="text-xs truncate" style={{ color: T.textMuted }}>{a.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                                            style={{ background: T.primaryDim, color: T.primaryText, letterSpacing: '0.08em' }}>{a.role}</span>
                                    </TableCell>
                                    <TableCell className="font-black" style={{ color: DASHBOARD_ACCENTS.green }}>{fmt(a.dealsWon)}</TableCell>
                                    <TableCell className="font-bold" style={{ color: T.textPrimary }}>{fmt(a.activeDeals)}</TableCell>
                                    <TableCell className="font-bold" style={{ color: T.textPrimary }}>{fmtK(a.revenueWon)}</TableCell>
                                    <TableCell style={{ color: T.textMuted }}>{fmtK(a.openRevenue)}</TableCell>
                                    <TableCell>
                                        <span style={{ color: T.textPrimary, fontWeight: 800 }}>{fmt(a.completedActivities)}</span>
                                        <span style={{ color: T.textMuted }}>/{fmt(a.totalActivities)}</span>
                                    </TableCell>
                                    <TableCell className="font-bold" style={{ color: T.textPrimary }}>{fmt(a.contacts)}</TableCell>
                                    <TableCell style={lastCell}>
                                        <div className="w-8 h-8 flex items-center justify-center transition-colors"
                                            style={{
                                                borderRadius: 12,
                                                background: T.primaryDim,
                                                border: `1px solid ${T.primary}20`,
                                            }}>
                                            <span className="material-symbols-outlined text-[15px]"
                                                style={{ color: T.primary }}>arrow_forward</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </table>
                </TableCard>
            ) : <Empty />}
        </Card>
    )
}

import { useNavigate } from 'react-router-dom'
import { T, ACTIVITY_STYLES } from '../../../constants/theme'
import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, Empty, TabSkeleton } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt } from '../dashboardDesign'
import { BarChart } from '../DashboardCharts'

export default function ActivitiesTab({ data }) {
    const navigate = useNavigate()
    if (!data) return <TabSkeleton />

    const totalActivities = (data.byType || []).reduce((sum, x) => sum + Number(x.count || 0), 0)
    const totalCalls = Number(data.byType?.find(x => x.type === 'CALL')?.count || 0)
    const totalMeetings = Number(data.byType?.find(x => x.type === 'MEETING')?.count || 0)
    const totalNotes = (data.byType || [])
        .filter(x => x.type !== 'CALL' && x.type !== 'MEETING')
        .reduce((sum, x) => sum + Number(x.count || 0), 0)

    const maxTypeCount = Math.max(...(data.byType || []).map(x => Number(x.count || 0)), 0)
    const ownerData = (data.byOwner || []).map(r => ({ label: r.ownerName, count: r.count }))

    return (
        <>
            {/* ── 4-KPI Metric Velocity Command Grid ─────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <DashboardStatCard icon="task_alt" label="Total Activities" value={fmt(totalActivities)} sub="Completed" />
                <DashboardStatCard icon="call" label="Calls Logged" value={fmt(totalCalls)} sub="Voice" />
                <DashboardStatCard icon="event" label="Meetings Scheduled" value={fmt(totalMeetings)} sub="Calendar" />
                <DashboardStatCard icon="notes" label="Notes & Tasks" value={fmt(totalNotes)} sub="Logs" />
            </div>

            {/* ── Main Activity Breakdown Cards ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Activities by Type */}
                <Card accent={DASHBOARD_ACCENTS.violet}>
                    <CardTitle icon="pie_chart" accent={DASHBOARD_ACCENTS.violet} meta={totalActivities ? `${totalActivities} logged` : undefined}>
                        Activities by Type
                    </CardTitle>
                    {data.byType?.length ? (
                        <div className="flex flex-col gap-3">
                            {data.byType.map(r => {
                                const s = ACTIVITY_STYLES[r.type] || ACTIVITY_STYLES.NOTE
                                const pct = maxTypeCount > 0 ? Math.max(5, (Number(r.count) / maxTypeCount) * 100) : 5
                                return (
                                    <div key={r.type} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-150"
                                        style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}>
                                        <div className="w-9 h-9 flex items-center justify-center shrink-0"
                                            style={{ borderRadius: 12, background: s.bg, border: `1px solid ${s.color}22` }}>
                                            <span className="material-symbols-outlined filled text-[14px]"
                                                style={{ color: s.color }}>{s.icon}</span>
                                        </div>
                                        <span className="text-xs font-black w-24 shrink-0 uppercase"
                                            style={{ color: T.textSecondary }}>{r.type}</span>
                                        <div className="flex-1 h-6 rounded-xl overflow-hidden"
                                            style={{ background: T.surfaceHigh, border: `1px solid ${T.borderSubtle}` }}>
                                            <div className="h-full rounded-xl transition-all duration-500"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}, ${DASHBOARD_ACCENTS.gold})` }} />
                                        </div>
                                        <span className="text-sm font-black w-10 text-right"
                                            style={{ color: T.textPrimary }}>{fmt(r.count)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <Empty
                            icon="task_alt"
                            title="No Activities Logged Yet"
                            subtitle="Log customer phone calls, team meetings, and task reminders to build activity velocity."
                            actionLabel="+ Schedule Activity"
                            onAction={() => navigate('/activities')}
                        />
                    )}
                </Card>

                {/* Activities by Owner */}
                <Card accent={DASHBOARD_ACCENTS.teal}>
                    <CardTitle icon="person" accent={DASHBOARD_ACCENTS.teal} meta={ownerData.length ? `${ownerData.length} Reps` : undefined}>
                        Activities Velocity by Rep
                    </CardTitle>
                    {ownerData.length ? (
                        <BarChart
                            data={ownerData}
                            valueKey="count"
                            labelKey="label"
                        />
                    ) : (
                        <Empty
                            icon="groups"
                            title="No Rep Velocity Recorded"
                            subtitle="Rep activity metrics will calculate once team agents log interaction timestamps."
                            actionLabel="+ Go to Activities"
                            onAction={() => navigate('/activities')}
                        />
                    )}
                </Card>
            </div>
        </>
    )
}

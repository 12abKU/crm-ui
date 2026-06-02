import { T, ACTIVITY_STYLES } from '../../../constants/theme'
import { Card, CardTitle, TabSkeleton } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt } from '../dashboardDesign'
import { BarChart } from '../DashboardCharts'

// Props: data  (unchanged — data comes from /api/dashboard/activities)
export default function ActivitiesTab({ data }) {
    if (!data) return <TabSkeleton />
    const maxTypeCount = Math.max(...(data.byType || []).map(x => Number(x.count || 0)), 0)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Activities by Type */}
            <Card accent={DASHBOARD_ACCENTS.violet}>
                <CardTitle icon="pie_chart" accent={DASHBOARD_ACCENTS.violet}>Activities by Type</CardTitle>
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
                                    <span className="text-xs font-black w-20 shrink-0 uppercase"
                                        style={{ color: T.textSecondary }}>{r.type}</span>
                                    <div className="flex-1 h-6 rounded-xl overflow-hidden"
                                        style={{ background: T.surfaceHigh, border: `1px solid ${T.borderSubtle}` }}>
                                        <div className="h-full rounded-xl transition-all duration-500"
                                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}, ${DASHBOARD_ACCENTS.gold})` }} />
                                    </div>
                                    <span className="text-sm font-black w-8 text-right"
                                        style={{ color: T.textPrimary }}>{fmt(r.count)}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </Card>

            {/* Activities by Owner */}
            <Card accent={DASHBOARD_ACCENTS.teal}>
                <CardTitle icon="person" accent={DASHBOARD_ACCENTS.teal}>Activities by Owner</CardTitle>
                <BarChart
                    data={(data.byOwner || []).map(r => ({ label: r.ownerName, count: r.count }))}
                    valueKey="count"
                    labelKey="label"
                />
            </Card>
        </div>
    )
}

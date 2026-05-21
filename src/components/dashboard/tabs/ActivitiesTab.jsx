import { T, ACTIVITY_STYLES } from '../../../constants/theme'
import { Card, CardTitle, TabSkeleton, fmt } from '../DashboardWidgets'
import { BarChart } from '../DashboardCharts'

// Props: data  (unchanged — data comes from /api/dashboard/activities)
export default function ActivitiesTab({ data }) {
    if (!data) return <TabSkeleton />
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Activities by Type */}
            <Card>
                <CardTitle icon="pie_chart">Activities by Type</CardTitle>
                {data.byType?.length ? (
                    <div className="flex flex-col gap-3">
                        {data.byType.map(r => {
                            const s = ACTIVITY_STYLES[r.type] || ACTIVITY_STYLES.NOTE
                            const maxCount = Math.max(...data.byType.map(x => Number(x.count || 0)))
                            const pct = maxCount > 0 ? Math.max(5, (Number(r.count) / maxCount) * 100) : 5
                            return (
                                <div key={r.type} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: s.bg }}>
                                        <span className="material-symbols-outlined filled text-[14px]"
                                            style={{ color: s.color }}>{s.icon}</span>
                                    </div>
                                    <span className="text-xs font-bold w-20 shrink-0"
                                        style={{ color: T.textSecondary }}>{r.type}</span>
                                    <div className="flex-1 h-6 rounded-xl overflow-hidden"
                                        style={{ background: T.surfaceHigh }}>
                                        <div className="h-full rounded-xl transition-all duration-500"
                                            style={{ width: `${pct}%`, background: s.color }} />
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
            <Card>
                <CardTitle icon="person">Activities by Owner</CardTitle>
                <BarChart
                    data={(data.byOwner || []).map(r => ({ label: r.ownerName, count: r.count }))}
                    valueKey="count"
                    labelKey="label"
                />
            </Card>
        </div>
    )
}
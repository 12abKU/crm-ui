import { T, ACTIVITY_STYLES } from '../../../constants/theme'
import { Card, CardTitle, TabSkeleton, fmt } from '../DashboardWidgets'
import { BarChart } from '../DashboardCharts'

export default function ActivitiesTab({ data }) {
    if (!data) return <TabSkeleton />
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardTitle icon="pie_chart">Activities by Type</CardTitle>
                {data.byType?.length ? (
                    <div className="flex flex-col gap-3">
                        {data.byType.map(r => {
                            const s = ACTIVITY_STYLES[r.type] || ACTIVITY_STYLES.NOTE
                            return (
                                <div key={r.type} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                        <span className="material-symbols-outlined text-[14px]" style={{ color: s.color }}>{s.icon}</span>
                                    </div>
                                    <span className="text-sm w-20 shrink-0" style={{ color: T.textSecondary }}>{r.type}</span>
                                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: T.surfaceHigh }}>
                                        <div className="h-full rounded-full" style={{ width: `${Math.max(5, Number(r.count))}%`, background: s.color }} />
                                    </div>
                                    <span className="text-sm font-bold w-8 text-right" style={{ color: T.textPrimary }}>{fmt(r.count)}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </Card>
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
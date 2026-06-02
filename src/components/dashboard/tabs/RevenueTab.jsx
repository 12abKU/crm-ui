import { Card, CardTitle, StatBox, TabSkeleton } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmtK } from '../dashboardDesign'
import { ForecastChart, RevenueDonut } from '../DashboardCharts'

export default function RevenueTab({ data, activeStages = [] }) {
    if (!data) return <TabSkeleton />
    const total = (data.totalWon || 0) + (data.totalLost || 0)
    const wonPct = total > 0 ? Math.round((data.totalWon / total) * 100) : 0
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <StatBox label="Total Revenue Won" value={fmtK(data.totalWon)} icon="payments" color={DASHBOARD_ACCENTS.green} />
                <StatBox label="Total Revenue Lost" value={fmtK(data.totalLost)} icon="money_off" color={DASHBOARD_ACCENTS.red} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card accent={DASHBOARD_ACCENTS.green}>
                    <CardTitle icon="donut_large" accent={DASHBOARD_ACCENTS.green}>Won vs Lost Revenue</CardTitle>
                    <RevenueDonut wonPct={wonPct} totalWon={data.totalWon} totalLost={data.totalLost} />
                </Card>
                <Card accent={DASHBOARD_ACCENTS.gold}>
                    <CardTitle icon="trending_up" accent={DASHBOARD_ACCENTS.gold}>Forecast by Quarter</CardTitle>
                    <ForecastChart data={data.forecast} activeStages={activeStages} />
                </Card>
            </div>
        </>
    )
}

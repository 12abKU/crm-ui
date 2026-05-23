import { T } from '../../../constants/theme'
import { Card, CardTitle, StatBox, TabSkeleton, fmtK } from '../DashboardWidgets'
import { ForecastChart, RevenueDonut } from '../DashboardCharts'

export default function RevenueTab({ data, activeStages = [] }) {
    if (!data) return <TabSkeleton />
    const total = (data.totalWon || 0) + (data.totalLost || 0)
    const wonPct = total > 0 ? Math.round((data.totalWon / total) * 100) : 0
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <StatBox label="Total Revenue Won" value={fmtK(data.totalWon)} icon="payments" color={T.success} />
                <StatBox label="Total Revenue Lost" value={fmtK(data.totalLost)} icon="money_off" color={T.error} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardTitle icon="donut_large">Won vs Lost Revenue</CardTitle>
                    <RevenueDonut wonPct={wonPct} totalWon={data.totalWon} totalLost={data.totalLost} />
                </Card>
                <Card>
                    <CardTitle icon="trending_up">Forecast by Quarter</CardTitle>
                    <ForecastChart data={data.forecast} activeStages={activeStages} />
                </Card>
            </div>
        </>
    )
}
import { T } from '../../../constants/theme'
import { usePipelineStages } from '../../../hooks/usePipelineStages'
import {
    Card,
    CardTitle,
    Empty,
    StatBox,
    TabSkeleton,
    TableCard,
    TableCell,
    TableHeaderCell,
    TableRow,
} from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt, fmtK, tableSurface } from '../dashboardDesign'
import { BarChart } from '../DashboardCharts'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function BottlenecksTab({ data, activeStages = [] }) {
    const { getStageLabel, getStageStyle: getPipelineStageStyle } = usePipelineStages()
    if (!data) return <TabSkeleton />

    const getStageStyle = (stageKey) => getPipelineStageStyle(stageKey)
    const avgDaysData = (data.avgDaysStuckByStage || []).map(item => ({
        label: getStageLabel(item.stage),
        avgDays: item.avgDays
    }))
    const bottleneckPieData = (data.bottlenecks || []).map(item => {
        const style = getStageStyle(item.stage)
        return {
            name: getStageLabel(item.stage),
            value: item.count,
            fill: style.accent
        }
    })
    const firstCell = { color: T.textPrimary, borderLeft: `1px solid ${T.borderSubtle}`, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }
    const lastCell = { borderRight: `1px solid ${T.borderSubtle}`, borderTopRightRadius: 14, borderBottomRightRadius: 14 }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <StatBox label="Total Stuck Deals" value={fmt(data.totalStuck)} icon="warning" color={DASHBOARD_ACCENTS.red} />
                <StatBox
                    label="Most Bottlenecked Stage"
                    value={data.bottlenecks?.[0]?.stage ? getStageLabel(data.bottlenecks[0].stage) : 'None'}
                    icon="grid_view"
                    color={DASHBOARD_ACCENTS.gold}
                />
                <StatBox
                    label="Max Average Stuck Days"
                    value={data.avgDaysStuckByStage?.length ? `${Math.max(...data.avgDaysStuckByStage.map(x => x.avgDays))} days` : '0 days'}
                    icon="timer"
                    color={DASHBOARD_ACCENTS.blue}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                <Card accent={DASHBOARD_ACCENTS.gold}>
                    <CardTitle icon="hourglass_empty" accent={DASHBOARD_ACCENTS.gold}>Average Days Stuck</CardTitle>
                    {avgDaysData.length ? (
                        <BarChart data={avgDaysData} valueKey="avgDays" labelKey="label" />
                    ) : <Empty />}
                </Card>

                <Card accent={DASHBOARD_ACCENTS.rose}>
                    <CardTitle icon="donut_large" accent={DASHBOARD_ACCENTS.rose}>Bottleneck Distribution</CardTitle>
                    {bottleneckPieData.length ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6" style={{ minHeight: 220 }}>
                            <div className="relative w-40 h-40 shrink-0 mx-auto sm:mx-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <PieChart>
                                        <Pie
                                            data={bottleneckPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={3}
                                            dataKey="value"
                                            isAnimationActive
                                        >
                                            {bottleneckPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: T.surfaceHigh,
                                                border: `1px solid ${T.primary}50`,
                                                borderRadius: '12px',
                                                color: T.textPrimary,
                                                fontSize: '12px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-2 overflow-auto max-h-48 flex-1 pr-2">
                                {bottleneckPieData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs rounded-xl px-3 py-2"
                                        style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.fill }} />
                                            <span className="truncate" style={{ color: T.textSecondary }}>{item.name}</span>
                                        </div>
                                        <span className="font-black shrink-0" style={{ color: T.textPrimary }}>{item.value} {item.value === 1 ? 'deal' : 'deals'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <Empty />}
                </Card>
            </div>

            <Card accent={DASHBOARD_ACCENTS.red}>
                <CardTitle icon="list" accent={DASHBOARD_ACCENTS.red} meta={data.stuckDeals?.length ? `${data.stuckDeals.length} stuck` : undefined}>
                    Deals Stuck
                </CardTitle>
                {data.stuckDeals?.length ? (
                    <TableCard>
                        <table className="w-full text-sm" style={tableSurface}>
                            <thead>
                                <tr>
                                    {['Deal', 'Account', 'Stage', 'Amount', 'Days Stuck', 'Owner'].map(h => (
                                        <TableHeaderCell key={h}>{h}</TableHeaderCell>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.stuckDeals.map((d) => {
                                    const s = getStageStyle(d.stage)
                                    const label = activeStages.find(x => x.stageKey === d.stage)?.label || d.stage
                                    return (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-bold min-w-[220px]" style={firstCell}>{d.title}</TableCell>
                                            <TableCell>{d.accountName || '-'}</TableCell>
                                            <TableCell>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-black"
                                                    style={{ background: s.badgeBg, color: s.badgeColor }}>
                                                    {label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-black" style={{ color: T.textPrimary }}>{d.amount ? fmtK(d.amount) : '-'}</TableCell>
                                            <TableCell className="font-black" style={{ color: DASHBOARD_ACCENTS.red }}>{d.daysStuck} days</TableCell>
                                            <TableCell className="text-xs" style={{ ...lastCell, color: T.textMuted }}>{d.ownerName || '-'}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </tbody>
                        </table>
                    </TableCard>
                ) : <Empty />}
            </Card>
        </>
    )
}

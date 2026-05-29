import { T } from '../../../constants/theme'
import { usePipelineStages } from '../../../hooks/usePipelineStages'
import { Card, CardTitle, StatBox, Empty, TabSkeleton, fmt, fmtK } from '../DashboardWidgets'
import { BarChart } from '../DashboardCharts'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function BottlenecksTab({ data, activeStages = [] }) {
    const { getStageLabel, getStageStyle: getPipelineStageStyle } = usePipelineStages()
    if (!data) return <TabSkeleton />

    const getStageStyle = (stageKey) => {
        return getPipelineStageStyle(stageKey)
    }

    // Format average days stuck per stage for BarChart component
    const avgDaysData = (data.avgDaysStuckByStage || []).map(item => ({
        label: getStageLabel(item.stage),
        avgDays: item.avgDays
    }));

    // Format bottleneck counts for PieChart
    const bottleneckPieData = (data.bottlenecks || []).map(item => {
        const style = getStageStyle(item.stage);
        return {
            name: getStageLabel(item.stage),
            value: item.count,
            fill: style.accent
        };
    });

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <StatBox label="Total Stuck Deals (≥ 5 Days)" value={fmt(data.totalStuck)} icon="warning" color={T.error} />
                <StatBox 
                    label="Most Bottlenecked Stage" 
                    value={data.bottlenecks?.[0]?.stage ? getStageLabel(data.bottlenecks[0].stage) : 'None'} 
                    icon="grid_view" 
                    color={T.primary} 
                />
                <StatBox 
                    label="Max Average Stuck Days" 
                    value={data.avgDaysStuckByStage?.length ? `${Math.max(...data.avgDaysStuckByStage.map(x => x.avgDays))} days` : '0 days'} 
                    icon="timer" 
                    color={T.chartBlue} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                <Card>
                    <CardTitle icon="hourglass_empty">Average Days Stuck per Stage</CardTitle>
                    {avgDaysData.length ? (
                        <BarChart data={avgDaysData} valueKey="avgDays" labelKey="label" />
                    ) : <Empty />}
                </Card>
                
                <Card>
                    <CardTitle icon="donut_large">Bottleneck Distribution (Deals count)</CardTitle>
                    {bottleneckPieData.length ? (
                        <div className="flex items-center gap-6" style={{ height: 220 }}>
                            <div className="relative w-40 h-40 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
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
                                    <div key={index} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                                            <span style={{ color: T.textSecondary }}>{item.name}</span>
                                        </div>
                                        <span className="font-bold" style={{ color: T.textPrimary }}>{item.value} {item.value === 1 ? 'deal' : 'deals'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <Empty />}
                </Card>
            </div>

            <Card>
                <CardTitle icon="list">Deals Stuck (≥ 5 Days)</CardTitle>
                {data.stuckDeals?.length ? (
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                                    {['Deal', 'Account', 'Stage', 'Amount', 'Days Stuck', 'Owner'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wider"
                                            style={{ color: T.textMuted }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.stuckDeals.map((d, i) => {
                                    const s = getStageStyle(d.stage)
                                    const label = activeStages.find(x => x.stageKey === d.stage)?.label || d.stage
                                    return (
                                        <tr key={d.id} style={{ background: i % 2 === 0 ? T.surfaceHigh : 'transparent' }}>
                                            <td className="py-2.5 px-3 font-semibold" style={{ color: T.textPrimary }}>{d.title}</td>
                                            <td className="py-2.5 px-3" style={{ color: T.textSecondary }}>{d.accountName || '—'}</td>
                                            <td className="py-2.5 px-3">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                                    style={{ background: s.badgeBg, color: s.badgeColor }}>
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-bold" style={{ color: T.textPrimary }}>{d.amount ? fmtK(d.amount) : '—'}</td>
                                            <td className="py-2.5 px-3 font-bold" style={{ color: T.error }}>{d.daysStuck} days</td>
                                            <td className="py-2.5 px-3 text-xs" style={{ color: T.textMuted }}>{d.ownerName || '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : <Empty />}
            </Card>
        </>
    )
}

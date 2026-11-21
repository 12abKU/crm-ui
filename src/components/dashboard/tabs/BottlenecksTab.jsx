import { useNavigate } from 'react-router-dom'
import { T } from '../../../constants/theme'
import { usePipelineStages } from '../../../hooks/usePipelineStages'
import DashboardStatCard from '../DashboardStatCard'
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
import { BarChart } from '../DashboardCharts'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function BottlenecksTab({ data, activeStages = [] }) {
    const navigate = useNavigate()
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
            {/* ── 3-KPI Bottleneck Command Grid ──────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                <DashboardStatCard
                    icon="warning"
                    label="Total Stuck Deals"
                    value={fmt(data.totalStuck)}
                    sub={data.totalStuck === 0 ? 'Optimal Flow' : 'Attention'}
                />
                <DashboardStatCard
                    icon="grid_view"
                    label="Bottleneck Stage"
                    value={data.bottlenecks?.[0]?.stage ? getStageLabel(data.bottlenecks[0].stage) : 'None'}
                    sub="Highest Friction"
                />
                <DashboardStatCard
                    icon="timer"
                    label="Max Average Stuck Days"
                    value={data.avgDaysStuckByStage?.length ? `${Math.max(...data.avgDaysStuckByStage.map(x => x.avgDays))} days` : '0 days'}
                    sub="Cycle Delay"
                />
            </div>

            {data.totalStuck === 0 ? (
                /* ── High-Velocity Zero Friction Hero ───────────── */
                <div
                    className="p-8 sm:p-12 rounded-3xl border text-center flex flex-col items-center justify-center relative overflow-hidden my-4"
                    style={{
                        background: `radial-gradient(ellipse at top, ${T.primary}15 0%, ${T.surface} 70%)`,
                        borderColor: `${T.primary}30`,
                        boxShadow: `0 8px 32px -4px ${T.primary}15`,
                    }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-emerald-500/30 shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
                        }}
                    >
                        <span className="material-symbols-outlined text-[32px] text-emerald-400">
                            verified
                        </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Zero Bottlenecks Detected
                    </h3>
                    <p className="text-sm max-w-md mt-2 leading-relaxed" style={{ color: T.textMuted }}>
                        All active pipeline deals are progressing smoothly across stages within normal cycle times. No stalled opportunities require intervention.
                    </p>
                    <button
                        onClick={() => navigate('/deals')}
                        className="mt-6 crm-btn-primary flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">handshake</span>
                        Review Live Deals Pipeline
                    </button>
                </div>
            ) : (
                <>
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

                    <Card accent={DASHBOARD_ACCENTS.red}
                        className="lg:sticky lg:top-20 flex flex-col"
                        style={{ maxHeight: 'calc(100vh - 100px)' }}>
                        <CardTitle icon="list" accent={DASHBOARD_ACCENTS.red} meta={data.stuckDeals?.length ? `${data.stuckDeals.length} stuck` : undefined}>
                            Deals Stuck
                        </CardTitle>
                        {data.stuckDeals?.length ? (
                            <TableCard className="flex-1">
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
                                                <TableRow key={d.id} onClick={() => navigate(`/deals?dealId=${d.id}`)}>
                                                    <TableCell className="font-bold min-w-[200px]" style={firstCell}>{d.title}</TableCell>
                                                    <TableCell>{d.accountName || '-'}</TableCell>
                                                    <TableCell>
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-black"
                                                            style={{ background: s.badgeBg, color: s.badgeColor }}>
                                                            {label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-black" style={{ color: T.textPrimary }}>{d.amount ? fmtK(d.amount) : '-'}</TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-0.5 rounded-md text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/20">
                                                            {d.daysInStage} days
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-xs" style={{ ...lastCell, color: T.textMuted }}>{d.ownerName || '-'}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </TableCard>
                        ) : (
                            <Empty
                                icon="check_circle"
                                title="No Stuck Deals"
                                subtitle="All deals are within standard velocity thresholds."
                            />
                        )}
                    </Card>
                </>
            )}
        </>
    )
}

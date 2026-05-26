import { useEffect, useState } from 'react'
import { T } from '../../../constants/theme'
import { usePipelineStages } from '../../../hooks/usePipelineStages'
import { Card, CardTitle, StatBox, Empty, TabSkeleton, fmt, fmtK } from '../DashboardWidgets'
import { FunnelChart, ForecastChart, WinRateDonut, BarChart } from '../DashboardCharts'
import api from '../../../api'

export default function DealsTab({ data, activeStages = [] }) {
    const { getStageLabel, getStageStyle: getPipelineStageStyle } = usePipelineStages()
    if (!data) return <TabSkeleton />
    const winRate = data.winRate ?? 0

    const [velocity, setVelocity] = useState([])
    const [velocityLoading, setVelocityLoading] = useState(true)

    useEffect(() => {
        api.get('/api/dashboard/deals/velocity')
            .then(r => {
                const formatted = r.data.map(d => ({
                    ...d,
                    stageLabel: getStageLabel(d.stage)
                }))
                setVelocity(formatted)
            })
            .catch(() => setVelocity([]))
            .finally(() => setVelocityLoading(false))
    }, [])

    const getStageStyle = (stageKey) => {
        return getPipelineStageStyle(stageKey)
    }

    return (
        <>
            <div className="grid grid-cols-4 gap-4 mb-5">
                <StatBox label="Revenue Won" value={fmtK(data.wonRevenue)} icon="payments" color={T.success} />
                <StatBox label="Revenue Lost" value={fmtK(data.lostRevenue)} icon="money_off" color={T.error} />
                <StatBox label="Deals Won" value={fmt(data.wonCount)} icon="check_circle" color={T.success} />
                <StatBox label="Deals Lost" value={fmt(data.lostCount)} icon="cancel" color={T.error} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <Card>
                    <CardTitle icon="percent">Win Rate</CardTitle>
                    <WinRateDonut winRate={winRate} wonCount={data.wonCount} lostCount={data.lostCount} />
                </Card>
                <Card>
                    <CardTitle icon="filter_alt">Open Deals by Stage</CardTitle>
                    <FunnelChart stages={data.openDealsByStage} activeStages={activeStages} />
                </Card>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <Card>
                    <CardTitle icon="trending_up">Forecast by Quarter</CardTitle>
                    <ForecastChart data={data.forecast} activeStages={activeStages} />
                </Card>
                <Card>
                    <CardTitle icon="speed">Pipeline Velocity (Avg Days in Stage)</CardTitle>
                    {velocityLoading ? (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                            <span className="text-sm" style={{ color: T.textMuted }}>Loading velocity...</span>
                        </div>
                    ) : (
                        <BarChart data={velocity} valueKey="avgDays" labelKey="stageLabel" />
                    )}
                </Card>
            </div>
            <Card>
                <CardTitle icon="list">Open Deals</CardTitle>
                {data.openDeals?.length ? (
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                                    {['Deal', 'Account', 'Stage', 'Amount', 'Close Date', 'Owner'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wider"
                                            style={{ color: T.textMuted }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.openDeals.map((d, i) => {
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
                                            <td className="py-2.5 px-3 text-xs" style={{ color: T.textMuted }}>{d.expectedCloseDate || '—'}</td>
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
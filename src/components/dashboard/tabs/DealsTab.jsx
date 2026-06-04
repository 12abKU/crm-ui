import { useEffect, useState } from 'react'
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
import { FunnelChart, ForecastChart, WinRateDonut, BarChart } from '../DashboardCharts'
import api from '../../../api'

export default function DealsTab({ data, activeStages = [] }) {
    const { getStageLabel, getStageStyle: getPipelineStageStyle } = usePipelineStages()
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
    }, [getStageLabel])

    if (!data) return <TabSkeleton />

    const winRate = data.winRate ?? 0
    const getStageStyle = (stageKey) => getPipelineStageStyle(stageKey)
    const firstCell = { color: T.textPrimary, borderLeft: `1px solid ${T.borderSubtle}`, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }
    const lastCell = { borderRight: `1px solid ${T.borderSubtle}`, borderTopRightRadius: 14, borderBottomRightRadius: 14 }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <StatBox label="Revenue Won" value={fmtK(data.wonRevenue)} icon="payments" color={DASHBOARD_ACCENTS.green} />
                <StatBox label="Revenue Lost" value={fmtK(data.lostRevenue)} icon="money_off" color={DASHBOARD_ACCENTS.red} />
                <StatBox label="Deals Won" value={fmt(data.wonCount)} icon="check_circle" color={DASHBOARD_ACCENTS.green} />
                <StatBox label="Deals Lost" value={fmt(data.lostCount)} icon="cancel" color={DASHBOARD_ACCENTS.red} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                <Card accent={DASHBOARD_ACCENTS.green}>
                    <CardTitle icon="percent" accent={DASHBOARD_ACCENTS.green}>Win Rate</CardTitle>
                    <WinRateDonut winRate={winRate} wonCount={data.wonCount} lostCount={data.lostCount} />
                </Card>
                <Card accent={DASHBOARD_ACCENTS.blue}>
                    <CardTitle icon="filter_alt" accent={DASHBOARD_ACCENTS.blue}>Open Deals by Stage</CardTitle>
                    <FunnelChart stages={data.openDealsByStage} activeStages={activeStages} />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                <Card accent={DASHBOARD_ACCENTS.gold}>
                    <CardTitle icon="trending_up" accent={DASHBOARD_ACCENTS.gold}>Forecast by Quarter</CardTitle>
                    <ForecastChart data={data.forecast} activeStages={activeStages} />
                </Card>
                <Card accent={DASHBOARD_ACCENTS.violet}>
                    <CardTitle icon="speed" accent={DASHBOARD_ACCENTS.violet}>Pipeline Velocity</CardTitle>
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

            <Card accent={DASHBOARD_ACCENTS.teal}
                className="lg:sticky lg:top-20 flex flex-col"
                style={{ maxHeight: 'calc(100vh - 100px)' }}>
                <CardTitle icon="list" accent={DASHBOARD_ACCENTS.teal} meta={data.openDeals?.length ? `${data.openDeals.length} open` : undefined}>
                    Open Deals
                </CardTitle>
                {data.openDeals?.length ? (
                    <TableCard className="flex-1">
                        <table className="w-full text-sm" style={tableSurface}>
                            <thead>
                                <tr>
                                    {['Deal', 'Account', 'Stage', 'Amount', 'Close Date', 'Owner'].map(h => (
                                        <TableHeaderCell key={h}>{h}</TableHeaderCell>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.openDeals.map((d) => {
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
                                            <TableCell className="text-xs" style={{ color: T.textMuted }}>{d.expectedCloseDate || '-'}</TableCell>
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

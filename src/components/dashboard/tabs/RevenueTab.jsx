import { useNavigate } from 'react-router-dom'
import { T } from '../../../constants/theme'
import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, TabSkeleton } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmtK } from '../dashboardDesign'
import { ForecastChart, RevenueDonut } from '../DashboardCharts'

export default function RevenueTab({ data, activeStages = [] }) {
    const navigate = useNavigate()
    if (!data) return <TabSkeleton />
    const total = (data.totalWon || 0) + (data.totalLost || 0)
    const wonPct = total > 0 ? Math.round((data.totalWon / total) * 100) : 0

    return (
        <>
            {/* ── 4-KPI Revenue Command Grid ─────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <DashboardStatCard icon="payments" label="Total Revenue Won" value={fmtK(data.totalWon)} sub="Realized" />
                <DashboardStatCard icon="money_off" label="Total Revenue Lost" value={fmtK(data.totalLost)} sub="Lost Deals" />
                <DashboardStatCard icon="percent" label="Win Conversion" value={`${wonPct}%`} sub="Success Rate" />
                <DashboardStatCard icon="trending_up" label="Closed Volume" value={fmtK(total)} sub="Decided" />
            </div>

            {/* ── Main Charts Grid ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                <Card accent={DASHBOARD_ACCENTS.green}>
                    <CardTitle icon="donut_large" accent={DASHBOARD_ACCENTS.green} meta={total > 0 ? `${wonPct}% Win` : undefined}>
                        Won vs Lost Revenue
                    </CardTitle>
                    <RevenueDonut wonPct={wonPct} totalWon={data.totalWon} totalLost={data.totalLost} />
                </Card>
                <Card accent={DASHBOARD_ACCENTS.gold}>
                    <CardTitle icon="trending_up" accent={DASHBOARD_ACCENTS.gold}>Forecast by Quarter</CardTitle>
                    <ForecastChart data={data.forecast} activeStages={activeStages} />
                </Card>
            </div>

            {/* ── Strategic Revenue Insight Footer ──────────── */}
            <div
                className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                style={{
                    background: T.surface,
                    borderColor: T.border,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: `${DASHBOARD_ACCENTS.green}18`,
                            border: `1px solid ${DASHBOARD_ACCENTS.green}30`,
                        }}
                    >
                        <span className="material-symbols-outlined filled text-[20px]" style={{ color: DASHBOARD_ACCENTS.green }}>
                            account_balance
                        </span>
                    </div>
                    <div>
                        <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>
                            Revenue Realization Pipeline
                        </h4>
                        <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                            Track deal velocity, closed ARR, and forecast probabilities across active sales cycles.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/deals')}
                    className="crm-btn-primary text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Explore Pipeline Deals
                </button>
            </div>
        </>
    )
}

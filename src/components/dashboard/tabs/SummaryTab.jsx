import { useNavigate } from 'react-router-dom'
import { T } from '../../../constants/theme'
import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, RecentActivityList } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt } from '../dashboardDesign'
import { FunnelChart, WinRateDonut } from '../DashboardCharts'

export default function SummaryTab({ data, loading }) {
    const navigate = useNavigate()

    return (
        <>
            {/* ── Executive 6-KPI Metric Command Grid ─────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5 mb-5">
                <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(data?.activeDeals)} sub="Pipeline" loading={loading} />
                <DashboardStatCard icon="payments" label="Won Revenue" value={`\u20B9${fmt(data?.totalRevenue)}`} sub="Closed" loading={loading} />
                <DashboardStatCard icon="business" label="Accounts" value={fmt(data?.totalAccounts)} sub="All Time" loading={loading} />
                <DashboardStatCard icon="groups" label="Contacts" value={fmt(data?.totalContacts)} sub="Network" loading={loading} />
                <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(data?.newContactsThisMonth)} sub="This Mo" loading={loading} />
                <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(data?.newDealsThisMonth)} sub="This Mo" loading={loading} />
            </div>

            {/* ── Quick Action Launcher Bar ───────────────────── */}
            <div
                className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-2xl mb-6 border transition-all"
                style={{
                    background: T.surface,
                    borderColor: T.border,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                        Quick Launch:
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => navigate('/deals')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                        style={{
                            background: T.primaryDim,
                            color: T.primary,
                            border: `1px solid ${T.primary}30`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        New Deal
                    </button>
                    <button
                        onClick={() => navigate('/contacts')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                        style={{
                            background: `${DASHBOARD_ACCENTS.teal}14`,
                            color: DASHBOARD_ACCENTS.teal,
                            border: `1px solid ${DASHBOARD_ACCENTS.teal}30`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        New Contact
                    </button>
                    <button
                        onClick={() => navigate('/leads')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                        style={{
                            background: `${DASHBOARD_ACCENTS.gold}14`,
                            color: DASHBOARD_ACCENTS.gold,
                            border: `1px solid ${DASHBOARD_ACCENTS.gold}30`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[16px]">person_search</span>
                        New Lead
                    </button>
                    <button
                        onClick={() => navigate('/activities')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                        style={{
                            background: `${DASHBOARD_ACCENTS.rose}14`,
                            color: DASHBOARD_ACCENTS.rose,
                            border: `1px solid ${DASHBOARD_ACCENTS.rose}30`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[16px]">add_task</span>
                        Log Activity
                    </button>
                </div>
            </div>

            {/* ── Charts Panel ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Card className="lg:col-span-2" accent={DASHBOARD_ACCENTS.blue}>
                    <CardTitle icon="filter_alt" accent={DASHBOARD_ACCENTS.blue}>Deal Stage Pipeline Velocity</CardTitle>
                    <div className="py-2">
                        {loading ? (
                            <div className="h-[240px] animate-pulse rounded-xl" style={{ background: 'rgba(148,163,184,0.14)' }} />
                        ) : (
                            <FunnelChart stages={data?.openDealsByStage} />
                        )}
                    </div>
                </Card>

                <Card accent={DASHBOARD_ACCENTS.green}>
                    <CardTitle icon="percent" accent={DASHBOARD_ACCENTS.green}>Win Rate Analytics</CardTitle>
                    <div className="py-3 flex justify-center items-center min-h-[240px]">
                        {loading ? (
                            <div className="w-20 h-20 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
                        ) : (
                            <WinRateDonut winRate={data?.winRate ?? 0} wonCount={data?.wonCount ?? 0} lostCount={data?.lostCount ?? 0} />
                        )}
                    </div>
                </Card>
            </div>

            {/* ── Recent Activity Feed ─────────────────────────── */}
            <Card accent={DASHBOARD_ACCENTS.teal}>
                <CardTitle icon="event_note" accent={DASHBOARD_ACCENTS.teal}>Recent Sales Activities</CardTitle>
                <RecentActivityList activities={data?.recentActivities} loading={loading} />
            </Card>
        </>
    )
}

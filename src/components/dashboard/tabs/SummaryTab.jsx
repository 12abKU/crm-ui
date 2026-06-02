import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, RecentActivityList } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt } from '../dashboardDesign'
import { FunnelChart, WinRateDonut } from '../DashboardCharts'

export default function SummaryTab({ data, loading }) {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(data?.activeDeals)} sub="Open pipeline" loading={loading} />
                <DashboardStatCard icon="payments" label="Revenue Won" value={`\u20B9${fmt(data?.totalRevenue)}`} sub="From won deals" loading={loading} />
                <DashboardStatCard icon="business" label="Accounts" value={fmt(data?.totalAccounts)} sub="All time" loading={loading} />
                <DashboardStatCard icon="groups" label="Contacts" value={fmt(data?.totalContacts)} sub="All time" loading={loading} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(data?.newContactsThisMonth)} sub="This month" loading={loading} />
                <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(data?.newDealsThisMonth)} sub="This month" loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                <Card className="lg:col-span-2" accent={DASHBOARD_ACCENTS.blue}>
                    <CardTitle icon="filter_alt" accent={DASHBOARD_ACCENTS.blue}>Deal Stage Funnel</CardTitle>
                    <div className="py-2">
                        {loading ? (
                            <div className="h-[220px] animate-pulse rounded-xl" style={{ background: 'rgba(148,163,184,0.14)' }} />
                        ) : (
                            <FunnelChart stages={data?.openDealsByStage} />
                        )}
                    </div>
                </Card>

                <Card accent={DASHBOARD_ACCENTS.green}>
                    <CardTitle icon="percent" accent={DASHBOARD_ACCENTS.green}>Win Rate Analytics</CardTitle>
                    <div className="py-4 flex justify-center items-center h-[220px]">
                        {loading ? (
                            <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-transparent animate-spin" />
                        ) : (
                            <WinRateDonut winRate={data?.winRate ?? 0} wonCount={data?.wonCount ?? 0} lostCount={data?.lostCount ?? 0} />
                        )}
                    </div>
                </Card>
            </div>

            <Card accent={DASHBOARD_ACCENTS.teal}>
                <CardTitle icon="event_note" accent={DASHBOARD_ACCENTS.teal}>Recent Activity</CardTitle>
                <RecentActivityList activities={data?.recentActivities} loading={loading} />
            </Card>
        </>
    )
}

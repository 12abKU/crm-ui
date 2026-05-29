import { T } from '../../../constants/theme'
import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, RecentActivityList, fmt } from '../DashboardWidgets'
import { FunnelChart, WinRateDonut } from '../DashboardCharts'

export default function SummaryTab({ data, loading }) {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(data?.activeDeals)} sub="Open pipeline" loading={loading} />
                <DashboardStatCard icon="payments" label="Revenue Won" value={`₹${fmt(data?.totalRevenue)}`} sub="From won deals" loading={loading} />
                <DashboardStatCard icon="business" label="Accounts" value={fmt(data?.totalAccounts)} sub="All time" loading={loading} />
                <DashboardStatCard icon="groups" label="Contacts" value={fmt(data?.totalContacts)} sub="All time" loading={loading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(data?.newContactsThisMonth)} sub="This month" loading={loading} />
                <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(data?.newDealsThisMonth)} sub="This month" loading={loading} />
            </div>

            {/* Visual Funnel and Win Rate charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                <Card className="lg:col-span-2">
                    <CardTitle icon="filter_alt">Deal Stage Funnel</CardTitle>
                    <div className="py-2">
                        {loading ? (
                            <div className="h-[220px] bg-slate-100 animate-pulse rounded-xl" />
                        ) : (
                            <FunnelChart stages={data?.openDealsByStage} />
                        )}
                    </div>
                </Card>
                <Card>
                    <CardTitle icon="percent">Win Rate Analytics</CardTitle>
                    <div className="py-4 flex justify-center items-center h-[220px]">
                        {loading ? (
                            <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-transparent animate-spin" />
                        ) : (
                            <WinRateDonut winRate={data?.winRate ?? 0} wonCount={data?.wonCount ?? 0} lostCount={data?.lostCount ?? 0} />
                        )}
                    </div>
                </Card>
            </div>

            <Card>
                <CardTitle icon="event_note">Recent Activity</CardTitle>
                <RecentActivityList activities={data?.recentActivities} loading={loading} />
            </Card>
        </>
    )
}
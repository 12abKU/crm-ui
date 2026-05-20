import { T } from '../../../constants/theme'
import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, RecentActivityList, fmt } from '../DashboardWidgets'

export default function SummaryTab({ data, loading }) {
    return (
        <>
            <div className="grid grid-cols-4 gap-4 mb-5">
                <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(data?.activeDeals)} sub="Open pipeline" loading={loading} />
                <DashboardStatCard icon="payments" label="Revenue Won" value={`₹${fmt(data?.totalRevenue)}`} sub="From won deals" loading={loading} />
                <DashboardStatCard icon="business" label="Accounts" value={fmt(data?.totalAccounts)} sub="All time" loading={loading} />
                <DashboardStatCard icon="groups" label="Contacts" value={fmt(data?.totalContacts)} sub="All time" loading={loading} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(data?.newContactsThisMonth)} sub="This month" loading={loading} />
                <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(data?.newDealsThisMonth)} sub="This month" loading={loading} />
            </div>
            <Card>
                <CardTitle icon="event_note">Recent Activity</CardTitle>
                <RecentActivityList activities={data?.recentActivities} loading={loading} />
            </Card>
        </>
    )
}
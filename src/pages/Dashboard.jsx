import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import DownloadReport from '../components/Downloadreport'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'
import RecentActivityList from '../components/dashboard/RecentActivityList'
import api from '../api'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const name = useSelector(state => state.auth.name)

    useEffect(() => {
        api.get('/api/dashboard').then(r => setStats(r.data)).catch(() => setStats(null)).finally(() => setLoading(false))
    }, [])

    const fmt = (value) => Number(value || 0).toLocaleString('en-IN')

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <section className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>
                            Welcome back, {name}
                        </h2>
                        <p className="text-base mt-2" style={{ color: T.textSecondary }}>
                            Here's what's happening with your accounts today.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <DownloadReport stats={stats} />
                        <button className="crm-btn-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>Generate Insights
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-3 gap-5 mb-5">
                    <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(stats?.activeDeals)} sub="Open pipeline" loading={loading} />
                    <DashboardStatCard icon="payments" label="Total Revenue" value={`₹${fmt(stats?.totalRevenue)}`} sub="From won deals" loading={loading} />
                    <DashboardStatCard icon="business" label="Total Accounts" value={fmt(stats?.totalAccounts)} sub="All time" loading={loading} />
                </div>
                <div className="grid grid-cols-3 gap-5 mb-8">
                    <DashboardStatCard icon="groups" label="Contacts" value={fmt(stats?.totalContacts)} sub="In your network" loading={loading} />
                    <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(stats?.newContactsThisMonth)} sub="This month" loading={loading} />
                    <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(stats?.newDealsThisMonth)} sub="This month" loading={loading} />
                </div>

                <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>Recent Activity</h3>
                    </div>
                    <RecentActivityList activities={stats?.recentActivities} loading={loading} />
                </div>
            </main>
        </div>
    )
}

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'
import RecentActivityList from '../components/dashboard/RecentActivityList'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import PageHeroBanner from '../components/ui/PageHeroBanner'
import api from '../api'
import DownloadReport from '../components/Downloadreport'
import usePermission from '../hooks/usePermission'
import { FunnelChart, WinRateDonut } from '../components/dashboard/DashboardCharts'
import { Card, CardTitle } from '../components/dashboard/DashboardWidgets'
import { DASHBOARD_ACCENTS } from '../components/dashboard/dashboardDesign'

export default function Dashboard() {
    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN'
    return isAdmin ? <AdminDashboard /> : <AgentDashboard />
}

function AgentDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const name = useSelector(state => state.auth.name)
    const canExport = usePermission('REPORTS_EXPORT')

    useEffect(() => {
        api.get('/api/dashboard')
            .then(r => setStats(r.data))
            .catch(() => setStats(null))
            .finally(() => setLoading(false))
    }, [])

    const fmt = (value) => Number(value || 0).toLocaleString('en-IN')

    return (
        <div className="min-h-screen" style={{ background: 'var(--crm-bg)' }}>
            <TopBar />
            <main className="p-4 md:p-8">
                {/* ── Ultra-Premium Hero Welcome Banner ────────────── */}
                <PageHeroBanner
                    icon="waving_hand"
                    title={`Welcome back, ${name || 'Agent'}`}
                    subtitle="Here's what's happening with your deals and pipeline today."
                    stats={[
                        { label: 'Active Deals', value: loading ? '...' : `${fmt(stats?.activeDeals)} Deals`, icon: 'handshake', color: '#38BDF8' },
                        { label: 'Network', value: loading ? '...' : `${fmt(stats?.totalContacts)} Contacts`, icon: 'groups', color: '#34D399' },
                    ]}
                    actions={canExport && <DownloadReport stats={stats} />}
                />

                {/* ── Stat Cards Unified 6-KPI Executive Grid ─────────── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5 mb-6">
                    <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(stats?.activeDeals)} sub="Pipeline" loading={loading} />
                    <DashboardStatCard icon="payments" label="Won Revenue" value={`\u20B9${fmt(stats?.totalRevenue)}`} sub="Closed" loading={loading} />
                    <DashboardStatCard icon="business" label="Accounts" value={fmt(stats?.totalAccounts)} sub="All time" loading={loading} />
                    <DashboardStatCard icon="groups" label="Contacts" value={fmt(stats?.totalContacts)} sub="Network" loading={loading} />
                    <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(stats?.newContactsThisMonth)} sub="This Mo" loading={loading} />
                    <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(stats?.newDealsThisMonth)} sub="This Mo" loading={loading} />
                </div>

                {/* ── Charts Panel ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                    <Card className="lg:col-span-2" accent={DASHBOARD_ACCENTS.blue}>
                        <CardTitle icon="filter_alt" accent={DASHBOARD_ACCENTS.blue}>My Deal Stage Funnel</CardTitle>
                        <div className="py-2">
                            {loading ? (
                                <div className="h-[220px] bg-slate-100/50 animate-pulse rounded-xl" />
                            ) : (
                                <FunnelChart stages={stats?.openDealsByStage} />
                            )}
                        </div>
                    </Card>
                    <Card accent={DASHBOARD_ACCENTS.green}>
                        <CardTitle icon="percent" accent={DASHBOARD_ACCENTS.green}>Win Rate Analytics</CardTitle>
                        <div className="py-4 flex justify-center items-center h-[220px]">
                            {loading ? (
                                <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-transparent animate-spin" />
                            ) : (
                                <WinRateDonut winRate={stats?.winRate ?? 0} wonCount={stats?.wonCount ?? 0} lostCount={stats?.lostCount ?? 0} />
                            )}
                        </div>
                    </Card>
                </div>

                {/* ── Recent Activity Card ──────────────────────────── */}
                <Card accent={DASHBOARD_ACCENTS.teal}>
                    <CardTitle
                        icon="event_note"
                        accent={DASHBOARD_ACCENTS.teal}
                        meta={stats?.recentActivities?.length > 0 ? `${stats.recentActivities.length} activities` : undefined}
                    >
                        Recent Activity
                    </CardTitle>
                    <div>
                        <RecentActivityList activities={stats?.recentActivities} loading={loading} />
                    </div>
                </Card>
            </main>
        </div>
    )
}

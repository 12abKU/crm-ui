import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'
import RecentActivityList from '../components/dashboard/RecentActivityList'
import AdminDashboard from '../components/dashboard/AdminDashboard'
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
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* ── Hero Welcome Banner ──────────────────────────── */}
                <section className="relative mb-8 overflow-hidden"
                    style={{
                        borderRadius: 26,
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 148,
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 22px 54px rgba(15,23,42,0.18)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
                        style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.08) 100%)' }} />

                    <div className="relative px-4 py-5 sm:px-6 lg:px-10 lg:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-bold mb-1" style={{ color: T.heroSubText }}>
                                Good day 👋
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                Welcome back, {name}
                            </h2>
                            <p className="text-sm mt-1.5" style={{ color: T.heroSubText }}>
                                Here's what's happening with your accounts today.
                            </p>
                        </div>
                        {/* ── Download Report button — lives here now ── */}
                        {canExport && <DownloadReport stats={stats} />}

                        {/* Right side — stat chips + download */}
                        <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.10)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                                    }}>
                                    <span className="material-symbols-outlined filled text-[16px]"
                                        style={{ color: T.successLight }}>handshake</span>
                                    <span className="text-sm font-bold" style={{ color: '#fff' }}>
                                        {loading ? 'No value' : fmt(stats?.activeDeals)} Deals
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.10)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                                    }}>
                                    <span className="material-symbols-outlined filled text-[16px]"
                                        style={{ color: T.sidebarText }}>groups</span>
                                    <span className="text-sm font-bold" style={{ color: '#fff' }}>
                                        {loading ? 'No value' : fmt(stats?.totalContacts)} Contacts
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>


                {/* ── Stat Cards Row 1 ─────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(stats?.activeDeals)} sub="Open pipeline" loading={loading} />
                    <DashboardStatCard icon="payments" label="Revenue Won" value={`₹${fmt(stats?.totalRevenue)}`} sub="From won deals" loading={loading} />
                    <DashboardStatCard icon="business" label="Total Accounts" value={fmt(stats?.totalAccounts)} sub="All time" loading={loading} />
                </div>

                {/* ── Stat Cards Row 2 ─────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <DashboardStatCard icon="groups" label="Contacts" value={fmt(stats?.totalContacts)} sub="In your network" loading={loading} />
                    <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(stats?.newContactsThisMonth)} sub="This month" loading={loading} />
                    <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(stats?.newDealsThisMonth)} sub="This month" loading={loading} />
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

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T, ACTIVITY_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'
import RecentActivityList from '../components/dashboard/RecentActivityList'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import api from '../api'
import DownloadReport from '../components/Downloadreport'

export default function Dashboard() {
    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    return isAdmin ? <AdminDashboard /> : <AgentDashboard />
}

function AgentDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const name = useSelector(state => state.auth.name)
    const role = useSelector(s => s.auth.role)

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
            <main className="p-8">

                {/* ── Hero Welcome Banner ──────────────────────────── */}
                <section className="relative rounded-3xl overflow-hidden mb-8"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 148,
                    }}>
                    <div style={{
                        position: 'absolute', top: -50, right: -50, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${T.heroAccentGlow} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, left: '40%', width: 160, height: 160,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-10 py-8 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-bold mb-1" style={{ color: T.heroSubText }}>
                                Good day 👋
                            </p>
                            <h2 className="text-3xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                Welcome back, {name}
                            </h2>
                            <p className="text-sm mt-1.5" style={{ color: T.heroSubText }}>
                                Here's what's happening with your accounts today.
                            </p>
                        </div>
                        {/* ── Download Report button — lives here now ── */}
                        {role !== 'AGENT' && <DownloadReport stats={stats} />}


                        {/* Right side — stat chips + download */}
                        <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.13)',
                                    }}>
                                    <span className="material-symbols-outlined filled text-[16px]"
                                        style={{ color: T.successLight }}>handshake</span>
                                    <span className="text-sm font-bold" style={{ color: '#fff' }}>
                                        {loading ? '—' : fmt(stats?.activeDeals)} Deals
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.13)',
                                    }}>
                                    <span className="material-symbols-outlined filled text-[16px]"
                                        style={{ color: T.sidebarText }}>groups</span>
                                    <span className="text-sm font-bold" style={{ color: '#fff' }}>
                                        {loading ? '—' : fmt(stats?.totalContacts)} Contacts
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>


                {/* ── Stat Cards Row 1 ─────────────────────────────── */}
                <div className="grid grid-cols-3 gap-5 mb-5">
                    <DashboardStatCard icon="handshake" label="Active Deals" value={fmt(stats?.activeDeals)} sub="Open pipeline" loading={loading} />
                    <DashboardStatCard icon="payments" label="Revenue Won" value={`₹${fmt(stats?.totalRevenue)}`} sub="From won deals" loading={loading} />
                    <DashboardStatCard icon="business" label="Total Accounts" value={fmt(stats?.totalAccounts)} sub="All time" loading={loading} />
                </div>

                {/* ── Stat Cards Row 2 ─────────────────────────────── */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                    <DashboardStatCard icon="groups" label="Contacts" value={fmt(stats?.totalContacts)} sub="In your network" loading={loading} />
                    <DashboardStatCard icon="person_add" label="New Contacts" value={fmt(stats?.newContactsThisMonth)} sub="This month" loading={loading} />
                    <DashboardStatCard icon="task_alt" label="New Deals" value={fmt(stats?.newDealsThisMonth)} sub="This month" loading={loading} />
                </div>

                {/* ── Recent Activity Card ──────────────────────────── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                    {/* Card header */}
                    <div className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: `1px solid ${T.border}`, background: T.primaryFaint }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: T.primaryDim }}>
                                <span className="material-symbols-outlined filled text-[17px]"
                                    style={{ color: T.primary }}>event_note</span>
                            </div>
                            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>
                                Recent Activity
                            </h3>
                        </div>
                        {stats?.recentActivities?.length > 0 && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                style={{ background: T.primaryDim, color: T.primaryText }}>
                                {stats.recentActivities.length} activities
                            </span>
                        )}
                    </div>
                    <div className="p-4">
                        <RecentActivityList activities={stats?.recentActivities} loading={loading} />
                    </div>
                </div>

            </main>
        </div>
    )
}
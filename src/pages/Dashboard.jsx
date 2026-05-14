import { useEffect, useState } from 'react'
import { T, ACTIVITY_STYLES, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import DownloadReport from '../components/Downloadreport'
import Skeleton from 'react-loading-skeleton'

const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'Yesterday' : `${d} days ago`
}

const StatCard = ({ icon, label, value, sub, loading }) => (
    <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl" style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: T.primary }}>{icon}</span>
            </div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>{label}</p>
        {loading
            ? <Skeleton height={36} width={100} borderRadius={8} />
            : <h3 className="text-3xl font-black" style={{ color: T.textPrimary }}>{value}</h3>
        }
        {sub && <p className="text-[12px] mt-1" style={{ color: T.textMuted }}>{sub}</p>}
    </div>
)

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const name = localStorage.getItem('name') || 'User'

    useEffect(() => {
        api.get('/api/dashboard').then(r => setStats(r.data)).catch(() => setStats(null)).finally(() => setLoading(false))
    }, [])

    const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-[1440px] mx-auto">
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
                    <StatCard icon="handshake" label="Active Deals" value={fmt(stats?.activeDeals)} sub="Open pipeline" loading={loading} />
                    <StatCard icon="payments" label="Total Revenue" value={`₹${fmt(stats?.totalRevenue)}`} sub="From won deals" loading={loading} />
                    <StatCard icon="business" label="Total Accounts" value={fmt(stats?.totalAccounts)} sub="All time" loading={loading} />
                </div>
                <div className="grid grid-cols-3 gap-5 mb-8">
                    <StatCard icon="groups" label="Contacts" value={fmt(stats?.totalContacts)} sub="In your network" loading={loading} />
                    <StatCard icon="person_add" label="New Contacts" value={fmt(stats?.newContactsThisMonth)} sub="This month" loading={loading} />
                    <StatCard icon="task_alt" label="New Deals" value={fmt(stats?.newDealsThisMonth)} sub="This month" loading={loading} />
                </div>

                <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>Recent Activity</h3>
                    </div>

                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4 py-4"
                                style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                <Skeleton circle width={40} height={40} />
                                <div className="flex-1">
                                    <Skeleton height={12} width={200} borderRadius={6} />
                                    <Skeleton height={12} width={120} borderRadius={6} className="mt-1.5" />
                                </div>
                                <Skeleton height={24} width={60} borderRadius={20} />
                            </div>
                        ))
                    ) : stats?.recentActivities?.length > 0 ? (
                        stats.recentActivities.map((a, i) => {
                            const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                            const meta = [a.accountName, a.contactName, a.dealTitle].filter(Boolean).join(' · ')
                            const rowBg = ROW_COLORS[i % ROW_COLORS.length]
                            return (
                                <div key={a.id} className="flex items-start gap-4 py-4 px-3 rounded-xl mb-1"
                                    style={{ background: rowBg }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: s.bg }}>
                                        <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                                        {meta && <p className="text-[12px] mt-0.5 truncate" style={{ color: T.textMuted }}>{meta}</p>}
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                                        style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                                        {timeAgo(a.createdAt)}
                                    </span>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center py-12 gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>event_note</span>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No recent activity</p>
                            <p className="text-sm" style={{ color: T.textMuted }}>Log a call, email, or meeting to see it here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
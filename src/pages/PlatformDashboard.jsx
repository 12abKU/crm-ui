import { useEffect, useState } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'

const STATUS_STYLES = {
    ACTIVE: { bg: 'rgba(22,163,74,0.10)', color: '#16a34a' },
    SUSPENDED: { bg: 'rgba(220,38,38,0.10)', color: '#DC2626' },
    TRIAL: { bg: 'rgba(217,119,6,0.10)', color: '#D97706' },
}

const PLAN_STYLES = {
    FREE: { bg: 'rgba(120,113,108,0.10)', color: '#78716c' },
    PRO: { bg: 'rgba(37,99,235,0.10)', color: '#2563eb' },
    ENTERPRISE: { bg: 'rgba(124,58,237,0.10)', color: '#7c3aed' },
}

export default function PlatformDashboard() {
    const [stats, setStats] = useState(null)
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsRes, companiesRes] = await Promise.all([
                api.get('/api/platform/stats'),
                api.get('/api/platform/companies?page=0&size=50'),
            ])
            setStats(statsRes.data)
            setCompanies(companiesRes.data.content ?? [])
        } finally { setLoading(false) }
    }

    useEffect(() => { loadData() }, [])

    const updateStatus = async (id, status) => {
        setUpdating(id + 'status')
        try {
            await api.patch(`/api/platform/companies/${id}/status`, { status })
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c))
        } finally { setUpdating(null) }
    }

    const updatePlan = async (id, plan) => {
        setUpdating(id + 'plan')
        try {
            await api.patch(`/api/platform/companies/${id}/plan`, { plan })
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, plan } : c))
        } finally { setUpdating(null) }
    }

    const statCards = stats ? [
        { icon: 'domain', label: 'Total Companies', value: stats.totalCompanies, accent: T.primary },
        { icon: 'check_circle', label: 'Active', value: stats.activeCompanies, accent: '#16a34a' },
        { icon: 'block', label: 'Suspended', value: stats.suspendedCompanies, accent: '#DC2626' },
        { icon: 'group', label: 'Total Users', value: stats.totalUsers, accent: '#7c3aed' },
    ] : []

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: T.textPrimary }}>Platform Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: T.textMuted }}>Manage all companies on this platform</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {statCards.map(({ icon, label, value, accent }) => (
                        <div key={label} className="rounded-2xl p-5"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: accent + '18' }}>
                                <span className="material-symbols-outlined text-[18px]" style={{ color: accent }}>{icon}</span>
                            </div>
                            <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value}</p>
                            <p className="text-[11px] font-semibold mt-0.5" style={{ color: T.textMuted }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Companies table */}
                <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <h2 className="text-sm font-bold" style={{ color: T.textPrimary }}>All Companies</h2>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                {['Company', 'Slug', 'Plan', 'Status', 'Created', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: T.textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: T.textMuted }}>Loading...</td></tr>
                            ) : companies.map((company, i) => {
                                const ss = STATUS_STYLES[company.status] || STATUS_STYLES.ACTIVE
                                const ps = PLAN_STYLES[company.plan] || PLAN_STYLES.FREE
                                return (
                                    <tr key={company.id}
                                        style={{ background: i % 2 === 0 ? 'transparent' : T.surfaceRaised, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                                                    style={{ background: T.primaryDim, color: T.primary }}>
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs font-mono" style={{ color: T.textMuted }}>{company.slug}</td>
                                        <td className="px-5 py-3.5">
                                            <select value={company.plan}
                                                disabled={updating === company.id + 'plan'}
                                                onChange={e => updatePlan(company.id, e.target.value)}
                                                className="text-[11px] font-bold px-2 py-1 rounded-lg border-0 cursor-pointer outline-none"
                                                style={{ background: ps.bg, color: ps.color }}>
                                                {['FREE', 'PRO', 'ENTERPRISE'].map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <select value={company.status}
                                                disabled={updating === company.id + 'status'}
                                                onChange={e => updateStatus(company.id, e.target.value)}
                                                className="text-[11px] font-bold px-2 py-1 rounded-lg border-0 cursor-pointer outline-none"
                                                style={{ background: ss.bg, color: ss.color }}>
                                                {['ACTIVE', 'SUSPENDED', 'TRIAL'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>
                                            {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                {updating === company.id + 'status' || updating === company.id + 'plan' ? 'Saving...' : ''}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T, STAGE_STYLES, STAGE_LABELS, ACTIVITY_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'

const fmt = (v) => Number(v || 0).toLocaleString('en-IN')
const fmtK = (v) => {
    const n = Number(v || 0)
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${fmt(n)}`
}

export default function AgentProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [agent, setAgent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/api/dashboard/agent/${id}`)
            .then(r => setAgent(r.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div><TopBar />
            <main className="p-8 max-w-5xl mx-auto">
                <div className="h-32 rounded-2xl animate-pulse mb-5" style={{ background: T.surface }} />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: T.surface }} />)}
                </div>
            </main>
        </div>
    )

    if (!agent) return null
    const actCompletionRate = agent.totalActivities > 0
        ? Math.round((agent.completedActivities / agent.totalActivities) * 100) : 0

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: T.surfaceHigh, color: T.textSecondary, border: `1px solid ${T.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.color = T.primaryText }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textSecondary }}>
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back
                </button>


                {/* Header */}
                <div className="rounded-2xl p-6 mb-5 flex items-center gap-6"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary }}>{agent.name}</h2>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{agent.email}</p>
                    </div>
                    <span className="px-4 py-2 rounded-full text-sm font-bold"
                        style={{ background: T.primaryDim, color: T.primaryText }}>{agent.role}</span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <KpiCard icon="check_circle" label="Deals Won" value={fmt(agent.dealsWon)} color={T.success} />
                    <KpiCard icon="cancel" label="Deals Lost" value={fmt(agent.dealsLost)} color={T.error} />
                    <KpiCard icon="handshake" label="Active Deals" value={fmt(agent.activeDeals)} />
                    <KpiCard icon="groups" label="Contacts" value={fmt(agent.contacts)} />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <KpiCard icon="payments" label="Revenue Won" value={fmtK(agent.revenueWon)} color={T.success} />
                    <KpiCard icon="trending_up" label="Open Pipeline" value={fmtK(agent.openRevenue)} />
                    <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>task_alt</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Activity Completion</p>
                                <p className="text-xl font-black" style={{ color: T.textPrimary }}>
                                    {fmt(agent.completedActivities)}/{fmt(agent.totalActivities)}
                                </p>
                            </div>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: T.surfaceHigh }}>
                            <div className="h-full rounded-full" style={{ width: `${actCompletionRate}%`, background: T.primary }} />
                        </div>
                        <p className="text-xs mt-1.5 font-semibold" style={{ color: T.textMuted }}>{actCompletionRate}% completed</p>
                    </div>
                </div>

                {/* Open Deals + Recent Activities */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>handshake</span>
                            <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Open Deals</h3>
                            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: T.primaryDim, color: T.primaryText }}>{agent.openDeals?.length || 0}</span>
                        </div>
                        {agent.openDeals?.length ? agent.openDeals.map((d, i) => {
                            const s = STAGE_STYLES[d.stage] || STAGE_STYLES.NEW
                            return (
                                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl mb-1"
                                    style={{ background: i % 2 === 0 ? T.surfaceHigh : 'transparent' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{d.title}</p>
                                        <p className="text-xs" style={{ color: T.textMuted }}>{d.accountName || '—'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold block mb-1"
                                            style={{ background: s.badgeBg, color: s.badgeColor }}>{STAGE_LABELS[d.stage]}</span>
                                        {d.amount && <span className="text-xs font-bold" style={{ color: T.textPrimary }}>{fmtK(d.amount)}</span>}
                                    </div>
                                </div>
                            )
                        }) : <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No open deals</p>}
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>event_note</span>
                            <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Recent Activities</h3>
                        </div>
                        {agent.recentActivities?.length ? agent.recentActivities.map((a, i) => {
                            const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                            return (
                                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl mb-1"
                                    style={{ background: i % 2 === 0 ? T.surfaceHigh : 'transparent' }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                        <span className="material-symbols-outlined text-[14px]" style={{ color: s.color }}>{s.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{a.subject}</p>
                                        <p className="text-xs" style={{ color: T.textMuted }}>{a.accountName || a.type}</p>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: a.completed ? 'rgba(22,163,74,0.1)' : T.warningDim,
                                            color: a.completed ? T.success : T.warning
                                        }}>
                                        {a.completed ? 'Done' : 'Pending'}
                                    </span>
                                </div>
                            )
                        }) : <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No activities yet</p>}
                    </div>
                </div>
            </main>
        </div>
    )
}

function KpiCard({ icon, label, value, color }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color ? `${color}15` : T.primaryDim }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: color || T.primary }}>{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value}</p>
            </div>
        </div>
    )
}
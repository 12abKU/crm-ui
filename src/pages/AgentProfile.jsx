import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T, ACTIVITY_STYLES } from '../constants/theme'
import { usePipelineStages } from '../hooks/usePipelineStages'
import TopBar from '../components/TopBar'
import api from '../api'
import usePermission from '../hooks/usePermission'

// ── Helpers (unchanged) ───────────────────────────────────────
const fmt = (v) => Number(v || 0).toLocaleString('en-IN')
const fmtK = (v) => {
    const n = Number(v || 0)
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${fmt(n)}`
}

// ── KPI card ──────────────────────────────────────────────────
function KpiCard({ icon, label, value, color }) {
    const c = color || T.primary
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-150"
            style={{
                background: T.surface,
                border: `1.5px solid ${c}22`,
                boxShadow: `0 2px 10px ${c}08`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${c}18`; e.currentTarget.style.borderColor = `${c}40` }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 10px ${c}08`; e.currentTarget.style.borderColor = `${c}22` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c}18` }}>
                <span className="material-symbols-outlined filled text-[20px]" style={{ color: c }}>{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: c }}>{value}</p>
            </div>
        </div>
    )
}

export default function AgentProfile() {
    const { getStageLabel, getStageStyle } = usePipelineStages()
    const { id } = useParams()
    const navigate = useNavigate()
    const [agent, setAgent] = useState(null)
    const [loading, setLoading] = useState(true)
    const canExport = usePermission('REPORTS_EXPORT')

    // ── Data handler (unchanged) ───────────────────────────────
    useEffect(() => {
        api.get(`/api/dashboard/agent/${id}`)
            .then(r => setAgent(r.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div><TopBar />
            <main className="p-4 md:p-8 max-w-5xl mx-auto">
                <div className="h-36 rounded-3xl animate-pulse mb-6" style={{ background: T.surface }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            <main className="p-4 md:p-8 max-w-5xl mx-auto">

                {/* ── Top actions ───────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group w-full sm:w-auto"
                        style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                        <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                        Back
                    </button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {canExport && (
                            <>
                                <button onClick={async () => {
                                    const { openPdfAsync } = await import('../utils/downloadPdfAsync')
                                    openPdfAsync({
                                        startUrl: `/api/dashboard/agent/${id}/report/pdf/async`,
                                        statusUrl: (jobId) => `/api/dashboard/agent/${id}/report/pdf/async/${jobId}`,
                                        downloadUrl: (jobId) => `/api/dashboard/agent/${id}/report/pdf/async/${jobId}/download`,
                                    }).catch(() => {})
                                }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group"
                                    style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                                    onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    View Report
                                </button>

                                <button onClick={async () => {
                                    const { downloadPdfAsync, savePdfBlob } = await import('../utils/downloadPdfAsync')
                                    downloadPdfAsync({
                                        startUrl: `/api/dashboard/agent/${id}/report/pdf/async`,
                                        statusUrl: (jobId) => `/api/dashboard/agent/${id}/report/pdf/async/${jobId}`,
                                        downloadUrl: (jobId) => `/api/dashboard/agent/${id}/report/pdf/async/${jobId}/download`,
                                    }).then(({ blob, filename }) => savePdfBlob(blob, filename)).catch(() => {})
                                }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90"
                                    style={{ background: T.primary, color: '#fff', boxShadow: `0 4px 12px ${T.primary}40` }}>
                                    <span className="material-symbols-outlined text-[16px]">download</span>
                                    Download Report
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Hero banner ───────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                    }}>
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-6 md:px-8 md:py-6 flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shrink-0"
                            style={{
                                background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                color: '#fff',
                                boxShadow: `0 6px 20px ${T.avatarGlow}`,
                            }}>
                            {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                {agent.name}
                            </h2>
                            <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>{agent.email}</p>
                        </div>
                        <span className="px-4 py-2 rounded-xl text-sm font-bold shrink-0 w-full sm:w-auto text-center"
                            style={{
                                background: T.heroBadgeBg,
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.20)',
                            }}>
                            {agent.role}
                        </span>
                    </div>
                </div>

                {/* ── KPIs row 1 ───────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <KpiCard icon="check_circle" label="Deals Won"    value={fmt(agent.dealsWon)}    color={T.success} />
                    <KpiCard icon="cancel"       label="Deals Lost"   value={fmt(agent.dealsLost)}   color={T.error} />
                    <KpiCard icon="handshake"    label="Active Deals" value={fmt(agent.activeDeals)} />
                    <KpiCard icon="groups"       label="Contacts"     value={fmt(agent.contacts)} />
                </div>

                {/* ── KPIs row 2 ───────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <KpiCard icon="payments"    label="Revenue Won"   value={fmtK(agent.revenueWon)}  color={T.success} />
                    <KpiCard icon="trending_up" label="Open Pipeline" value={fmtK(agent.openRevenue)} />

                    {/* Activity completion card */}
                    <div className="rounded-2xl p-5 transition-all duration-150 sm:col-span-2 lg:col-span-1"
                        style={{
                            background: T.surface,
                            border: `1.5px solid ${T.primary}22`,
                            boxShadow: `0 2px 10px ${T.primary}08`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${T.primary}18`; e.currentTarget.style.borderColor = `${T.primary}40` }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 10px ${T.primary}08`; e.currentTarget.style.borderColor = `${T.primary}22` }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                style={{ background: T.primaryDim }}>
                                <span className="material-symbols-outlined filled text-[20px]" style={{ color: T.primary }}>task_alt</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                                    Activity Completion
                                </p>
                                <p className="text-xl font-black" style={{ color: T.primary }}>
                                    {fmt(agent.completedActivities)}<span className="text-sm font-normal" style={{ color: T.textMuted }}>/{fmt(agent.totalActivities)}</span>
                                </p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: T.surfaceHigh }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${actCompletionRate}%`,
                                    background: `linear-gradient(90deg, ${T.primary} 0%, ${T.progressGradEnd} 100%)`,
                                }} />
                        </div>
                        <p className="text-[11px] mt-1.5 font-semibold" style={{ color: T.textMuted }}>
                            {actCompletionRate}% completed
                        </p>
                    </div>
                </div>

                {/* ── Open Deals + Recent Activities ────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                    {/* Open Deals */}
                    <div className="rounded-2xl overflow-hidden lg:sticky lg:top-20 flex flex-col"
                        style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            maxHeight: 'calc(100vh - 100px)'
                        }}>
                        <div className="px-5 py-4 flex items-center gap-2 shrink-0"
                            style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <span className="material-symbols-outlined filled text-[16px]" style={{ color: T.primary }}>handshake</span>
                            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Open Deals</h3>
                            <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                {agent.openDeals?.length || 0}
                            </span>
                        </div>
                        <div className="p-3 overflow-y-auto flex-1">
                            {agent.openDeals?.length ? agent.openDeals.map((d) => {
                                const s = getStageStyle(d.stage)
                                return (
                                    <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all"
                                        style={{ background: T.borderSubtle }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                        onMouseLeave={e => e.currentTarget.style.background = T.borderSubtle}>
                                        <div className="w-1 h-6 rounded-full shrink-0" style={{ background: s.accent }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{d.title}</p>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>{d.accountName || '—'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold block mb-1"
                                                style={{ background: s.badgeBg, color: s.badgeColor }}>{getStageLabel(d.stage)}</span>
                                            {d.amount && <span className="text-[11px] font-bold" style={{ color: T.primary }}>{fmtK(d.amount)}</span>}
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[24px]" style={{ color: T.textMuted }}>inventory_2</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No open deals</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rounded-2xl overflow-hidden lg:sticky lg:top-20 flex flex-col"
                        style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            maxHeight: 'calc(100vh - 100px)'
                        }}>
                        <div className="px-5 py-4 flex items-center gap-2 shrink-0"
                            style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <span className="material-symbols-outlined filled text-[16px]" style={{ color: T.primary }}>event_note</span>
                            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Recent Activities</h3>
                        </div>
                        <div className="p-3 overflow-y-auto flex-1">
                            {agent.recentActivities?.length ? agent.recentActivities.map((a) => {
                                const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                                return (
                                    <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all"
                                        style={{ background: T.borderSubtle }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                        onMouseLeave={e => e.currentTarget.style.background = T.borderSubtle}>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: s.bg }}>
                                            <span className="material-symbols-outlined filled text-[14px]" style={{ color: s.color }}>{s.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{a.subject}</p>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>{a.accountName || a.type}</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                            style={{
                                                background: a.completed ? T.successDim : T.warningDim,
                                                color: a.completed ? T.success : T.warning,
                                            }}>
                                            {a.completed ? 'Done' : 'Pending'}
                                        </span>
                                    </div>
                                )
                            }) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[24px]" style={{ color: T.textMuted }}>event_busy</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No activities yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
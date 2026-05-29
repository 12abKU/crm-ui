import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { T, ACTIVITY_STYLES } from '../constants/theme'
import { usePipelineStages } from '../hooks/usePipelineStages'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'
import CallWidget from '../components/voice/CallWidget'
import CallLogTable from '../components/voice/CallLogTable'
import InlineEdit from '../components/InlineEdit'
import AddDealSlideForm from '../components/deals/AddDealSlideForm'
import InternalNotes from '../components/notes/InternalNotes'
import { useSelector } from 'react-redux'
import { usePermissions } from '../hooks/usePermission'
import RequirePermission from '../components/RequirePermission'
import EntityAuditHistory from '../components/audit/EntityAuditHistory'

// ── Helpers (unchanged) ─────────────────────────────────────────
const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'; if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24); return d === 1 ? 'Yesterday' : `${d} days ago`
}
const AVATARS = [T.primaryDim, T.secondaryDim, T.tertiaryDim, 'rgba(76,175,125,0.15)']
const AVATAR_COLORS_LIST = [T.primaryText, T.secondaryText, T.tertiaryText, '#4CAF7D']

// Avatar accent colors for hero gradient tints — defined in theme.js as T.heroAccents
const HERO_ACCENTS = T.heroAccents

// ── InfoRow ─────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm font-semibold break-all" style={{ color: value ? T.textPrimary : T.textMuted }}>
            {value || 'Not provided'}
        </p>
    </div>
)

// ── SectionCard ─────────────────────────────────────────────────
const SectionCard = ({ title, badge, icon, children, action }) => (
    <div className="rounded-2xl overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${T.border}`, background: T.primaryFaint }}>
            <div className="flex items-center gap-2.5">
                {icon && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[15px]"
                            style={{ color: T.primary }}>{icon}</span>
                    </div>
                )}
                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>{title}</h3>
                {badge !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: T.primaryDim, color: T.primaryText }}>{badge}</span>
                )}
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
)

export default function ContactProfile() {
    const { getStageLabel, getStageStyle } = usePipelineStages()
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [activeCall, setActiveCall] = useState(null)
    const [callLogs, setCallLogs] = useState([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [callPage, setCallPage] = useState(0)
    const [callTotal, setCallTotal] = useState(0)
    const [callTotalPages, setCallTotalPages] = useState(0)

    const [dealFormOpen, setDealFormOpen] = useState(false)

    const role = useSelector(state => state.auth.role)
    const can = usePermissions(['DEALS_CREATE'])
    const canCreateDeal = role === 'ADMIN' || role === 'SUPER_ADMIN' || can.DEALS_CREATE

    // ── Load call logs with pagination (unchanged) ────────────
    const loadCalls = async (p = 0) => {
        if (!id) return
        setLogsLoading(true)
        try {
            const r = await api.get(`/api/voice/logs/contact/${id}?page=${p}&size=5`)
            setCallLogs(r.data.content)
            setCallTotal(r.data.totalElements)
            setCallTotalPages(r.data.totalPages)
            setCallPage(p)
        } catch {
            setCallLogs([])
        } finally {
            setLogsLoading(false)
        }
    }

    const updateField = async (field, value) => {
        await api.put(`/api/contacts/${id}`, {
            firstName: profile.firstName, lastName: profile.lastName, email: profile.email,
            phone: profile.phone, designation: profile.designation, accountId: profile.account?.id || null,
            [field]: value
        })
        setProfile(p => ({ ...p, [field]: value }))
    }

    useEffect(() => { loadCalls(0) }, [id])

    useEffect(() => {
        const controller = new AbortController()
        api.get(`/api/contacts/${id}/profile`, { signal: controller.signal, suppressErrorToast: true })
            .then(r => setProfile(r.data))
            .catch(err => { if (!controller.signal.aborted) setProfile(null) })
            .finally(() => { if (!controller.signal.aborted) setLoading(false) })
        return () => controller.abort()
    }, [id])

    useEffect(() => {
        if (new URLSearchParams(location.search).get('tab') === 'notes' && profile) {
            const timer = setTimeout(() => {
                const notesEl = document.getElementById('internal-notes-section')
                if (notesEl) {
                    notesEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [location.search, profile])

    // ── Loading skeleton ─────────────────────────────────────────
    if (loading) return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">
                <div className="rounded-3xl overflow-hidden mb-6 p-8"
                    style={{ background: T.surfaceHigh, minHeight: 140 }}>
                    <div className="flex items-center gap-5">
                        <Skeleton circle width={72} height={72} />
                        <div>
                            <Skeleton height={28} width={240} borderRadius={8} />
                            <Skeleton height={14} width={160} borderRadius={6} className="mt-2" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-5 rounded-2xl" style={{ background: T.surfaceHigh }}>
                            <Skeleton height={10} width={80} borderRadius={4} />
                            <Skeleton height={28} width={60} borderRadius={6} className="mt-2" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Skeleton height={160} borderRadius={16} />
                        <Skeleton height={180} borderRadius={16} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Skeleton height={200} borderRadius={16} />
                        <Skeleton height={180} borderRadius={16} />
                    </div>
                </div>
            </main>
        </div>
    )

    // ── Not found ────────────────────────────────────────────────
    if (!profile) return (
        <div>
            <TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[30px]"
                            style={{ color: T.primary }}>person</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Contact not found</p>
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group"
                        style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                        <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                        Back
                    </button>
                </div>
            </div>
        </div>
    )

    const av = profile.id % 4
    const fullName = `${profile.firstName} ${profile.lastName || ''}`.trim()
    const heroAccent = HERO_ACCENTS[av]

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* ── Back button ───────────────────────────── */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center gap-2 mb-5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group w-full sm:w-auto"
                    style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                    Back
                </button>

                {/* ── Hero Profile Banner ───────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${T.sidebar} 0%, ${heroAccent.from} 50%, ${heroAccent.to} 100%)`,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -50, right: -50, width: 220, height: 220,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, left: '45%', width: 150, height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-6 lg:px-8 lg:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-5">
                            <div className="rounded-full flex items-center justify-center text-3xl font-black shrink-0"
                                style={{
                                    width: 72, height: 72,
                                    background: 'rgba(255,255,255,0.18)',
                                    border: '2px solid rgba(255,255,255,0.30)',
                                    color: '#fff',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                {profile.firstName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <InlineEdit value={profile.firstName} onSave={v => updateField('firstName', v)} placeholder="First name">
                                        <h1 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
                                            {profile.firstName}
                                        </h1>
                                    </InlineEdit>
                                    <InlineEdit value={profile.lastName} onSave={v => updateField('lastName', v)} placeholder="Last name">
                                        <h1 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
                                            {profile.lastName}
                                        </h1>
                                    </InlineEdit>
                                </div>
                                {profile.designation && (
                                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                        {profile.designation}
                                    </p>
                                )}
                                {profile.account && (
                                    <button onClick={() => navigate(`/accounts/${profile.account.id}`)}
                                        className="flex items-center gap-1.5 mt-1.5 hover:underline w-fit"
                                        style={{ color: 'rgba(255,255,255,0.85)' }}>
                                        <span className="material-symbols-outlined text-[13px]">business</span>
                                        <span className="text-sm font-semibold">{profile.account.name}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
                            <button
                                onClick={() => profile?.phone && setActiveCall(profile)}
                                disabled={!profile?.phone}
                                title={!profile?.phone ? 'No phone number' : `Call ${fullName}`}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 w-full sm:w-auto"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.20)',
                                    color: '#fff',
                                }}
                                onMouseEnter={e => { if (profile?.phone) e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>
                                <span className="material-symbols-outlined text-[16px]">call</span>Call
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.20)',
                                    color: '#fff',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>
                                <span className="material-symbols-outlined text-[16px]">mail</span>Email
                            </button>
                            {canCreateDeal && (
                                <button onClick={() => setDealFormOpen(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                                    style={{
                                        background: T.primary,
                                        border: '1px solid rgba(255,255,255,0.20)',
                                        color: '#fff',
                                        boxShadow: `0 4px 14px ${T.avatarGlow}`,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                    onMouseLeave={e => e.currentTarget.style.background = T.primary}>
                                    <span className="material-symbols-outlined text-[16px]">handshake</span>Add Deal
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Quick Stats Bar ───────────────────────── */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {[
                        { icon: 'handshake', label: 'Open Deals', value: profile.openDealCount, bg: T.primaryDim, color: T.chartBlue },
                        { icon: 'payments', label: 'Deal Value', value: '₹' + (profile.openDealAmount || 0).toLocaleString(), bg: 'rgba(22,163,74,0.12)', color: '#16A34A' },
                        { icon: 'event_note', label: 'Activities', value: profile.recentActivities?.length || 0, bg: 'rgba(83,141,141,0.14)', color: T.chartTeal },
                    ].map(({ icon, label, value, bg, color }) => (
                        <div key={label}
                            className="flex-1 min-w-[200px] flex items-center gap-4 p-5 rounded-2xl transition-all duration-150"
                            style={{
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                            }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                                <span className="material-symbols-outlined filled text-[22px]" style={{ color }}>{icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                                <p className="text-2xl font-black mt-0.5" style={{ color: T.textPrimary }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Call History ──────────────────────────── */}
                <SectionCard title="Call History" icon="call" badge={callTotal} >
                    <CallLogTable logs={callLogs} loading={logsLoading} compact />

                    {/* Pagination (unchanged) */}
                    {callTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-4"
                            style={{ borderTop: `1px solid ${T.border}` }}>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>
                                {callTotal} total · page {callPage + 1} of {callTotalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={callPage === 0}
                                    onClick={() => loadCalls(callPage - 1)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                                    ← Prev
                                </button>
                                <button
                                    disabled={callPage >= callTotalPages - 1}
                                    onClick={() => loadCalls(callPage + 1)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ── Main 2-col layout ─────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                    {/* Left: Overview + Open Deals */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Overview */}
                        <SectionCard title="Overview" icon="info">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoRow label="Email" value={profile.email} />
                                <InfoRow label="Phone" value={profile.phone} />
                                <InfoRow label="Designation" value={profile.designation} />
                                <InfoRow label="Account" value={profile.account?.name} />
                            </div>
                        </SectionCard>

                        {/* Open Deals */}
                        <SectionCard title="Open Deals" icon="handshake" badge={profile.openDeals?.length || 0}
                            action={canCreateDeal && (
                                <button onClick={() => setDealFormOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                                    style={{ background: T.primaryDim, color: T.primaryText }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                    <span className="material-symbols-outlined text-[13px]">add</span>Add Deal
                                </button>
                            )}>
                            {profile.openDeals?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {profile.openDeals.map(d => {
                                        const s = getStageStyle(d.stage)
                                        return (
                                            <div key={d.id}
                                                className="flex items-center justify-between p-4 rounded-xl transition-all duration-150"
                                                style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}
                                                onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                                onMouseLeave={e => e.currentTarget.style.background = T.borderSubtle}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                        style={{ background: T.primaryDim }}>
                                                        <span className="material-symbols-outlined filled text-[18px]"
                                                            style={{ color: T.primary }}>handshake</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{d.title}</p>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                                                            style={{ background: s.badgeBg, color: s.badgeColor }}>{getStageLabel(d.stage)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black" style={{ color: T.primaryText }}>
                                                    ₹{(d.amount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[28px]" style={{ color: T.textMuted }}>handshake</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No open deals</p>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Right sidebar: Recent Activity */}
                    <div className="flex flex-col gap-5">
                        <RequirePermission requires="NOTES_VIEW">
                            <div id="internal-notes-section">
                                <SectionCard title="Internal Notes" icon="rate_review">
                                    <div className="max-h-[500px] overflow-y-auto">
                                        <InternalNotes contactId={id} />
                                    </div>
                                </SectionCard>
                            </div>
                        </RequirePermission>

                        <SectionCard title="Recent Activity" icon="event_note">
                            {profile.recentActivities?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {profile.recentActivities.map((a, i) => {
                                        const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                                        return (
                                            <div key={a.id}
                                                className="flex items-start gap-3 py-3 px-2 rounded-xl transition-colors"
                                                style={{ background: i % 2 === 0 ? T.borderSubtle : 'transparent' }}
                                                onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.borderSubtle : 'transparent'}>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ background: s.bg }}>
                                                    <span className="material-symbols-outlined filled text-[14px]"
                                                        style={{ color: s.color }}>{s.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                                                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{timeAgo(a.createdAt)}</p>
                                                </div>
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                                                    style={{ background: s.bg, color: s.color }}>{a.type}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[26px]" style={{ color: T.textMuted }}>event_note</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No recent activity</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Audit History — admin only */}
                        <EntityAuditHistory entityType="CONTACT" entityId={Number(id)} />
                    </div>
                </div>
            </main>

            {/* AddDealSlideForm — all props identical (unchanged) */}
            <AddDealSlideForm
                open={dealFormOpen}
                onClose={() => setDealFormOpen(false)}
                onSuccess={() => {
                    setDealFormOpen(false)
                    api.get(`/api/contacts/${id}/profile`).then(r => setProfile(r.data))
                }}
                prefillAccount={profile.account ? { id: profile.account.id, name: profile.account.name } : undefined}
                prefillContact={{ id: profile.id, name: `${profile.firstName} ${profile.lastName || ''}`.trim() }}
            />

            {/* CallWidget — all props identical (unchanged) */}
            {activeCall && (
                <CallWidget
                    contact={activeCall}
                    onClose={() => setActiveCall(null)}
                    onCallComplete={() => {
                        setActiveCall(null)
                        loadCalls(0)
                    }}
                />
            )}
        </div>
    )
}
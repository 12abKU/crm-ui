import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T, ACTIVITY_STYLES, STAGE_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'
import CallWidget from '../components/voice/CallWidget'
import CallLogTable from '../components/voice/CallLogTable'


const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'; if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24); return d === 1 ? 'Yesterday' : `${d} days ago`
}
const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: value ? T.textPrimary : T.border }}>{value || 'Not provided'}</p>
    </div>
)
const AVATARS = [T.primaryDim, T.secondaryDim, T.tertiaryDim, 'rgba(76,175,125,0.15)']
const AVATAR_COLORS_LIST = [T.primaryText, T.secondaryText, T.tertiaryText, '#4CAF7D']

export default function ContactProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [activeCall, setActiveCall] = useState(null)
    const [callLogs, setCallLogs] = useState([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [callPage, setCallPage] = useState(0)
    const [callTotal, setCallTotal] = useState(0)
    const [callTotalPages, setCallTotalPages] = useState(0)

    // ── Load call logs with pagination ────────────────────────
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

    useEffect(() => { loadCalls(0) }, [id])

    useEffect(() => {
        const controller = new AbortController()
        api.get(`/api/contacts/${id}/profile`, { signal: controller.signal, suppressErrorToast: true })
            .then(r => setProfile(r.data))
            .catch(err => { if (!controller.signal.aborted) setProfile(null) })
            .finally(() => { if (!controller.signal.aborted) setLoading(false) })
        return () => controller.abort()
    }, [id])

    if (loading) return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton circle width={64} height={64} />
                    <div>
                        <Skeleton height={28} width={220} borderRadius={8} />
                        <Skeleton height={14} width={140} borderRadius={6} className="mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton height={10} width={80} borderRadius={4} />
                            <Skeleton height={16} width={150} borderRadius={6} className="mt-2" />
                        </div>
                    ))}
                </div>
                <Skeleton height={180} borderRadius={16} className="mb-6" />
                <div className="flex flex-col gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton circle width={32} height={32} />
                            <div className="flex-1">
                                <Skeleton height={13} width={200} borderRadius={6} />
                                <Skeleton height={13} width={130} borderRadius={6} className="mt-1.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )

    if (!profile) return (
        <div><TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>person</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>Contact not found</p>
                    <button onClick={() => navigate(-1)} className="crm-btn-ghost text-sm">← Back</button>
                </div>
            </div>
        </div>
    )

    const av = profile.id % 4
    const fullName = `${profile.firstName} ${profile.lastName || ''}`.trim()

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6 text-sm font-semibold hover:underline"
                    style={{ color: T.primary }}>
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>Back to Contacts
                </button>

                {/* Header card */}
                <div className="rounded-2xl p-6 mb-6 flex items-start justify-between gap-6"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shrink-0"
                            style={{ background: AVATARS[av], color: AVATAR_COLORS_LIST[av] }}>
                            {profile.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>{fullName}</h1>
                            {profile.designation && <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{profile.designation}</p>}
                            {profile.account && (
                                <button onClick={() => navigate(`/accounts/${profile.account.id}`)}
                                    className="flex items-center gap-1.5 mt-1.5 hover:underline w-fit"
                                    style={{ color: T.primaryText }}>
                                    <span className="material-symbols-outlined text-[14px]">business</span>
                                    <span className="text-sm font-semibold">{profile.account.name}</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => profile?.phone && setActiveCall(profile)}
                            disabled={!profile?.phone}
                            className="crm-btn-ghost flex items-center gap-2 text-sm"
                            title={!profile?.phone ? 'No phone number' : `Call ${fullName}`}>
                            <span className="material-symbols-outlined text-[16px]">call</span>Call
                        </button>
                        <button className="crm-btn-ghost flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[16px]">mail</span>Email
                        </button>
                        <button className="crm-btn-primary flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[16px]">handshake</span>Add Deal
                        </button>
                    </div>
                </div>

                {/* Call History */}
                <div className="rounded-2xl p-6 mb-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Call History</h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ background: T.primaryDim, color: T.primaryText }}>
                            {callTotal}
                        </span>
                    </div>

                    <CallLogTable logs={callLogs} loading={logsLoading} compact />

                    {/* Pagination */}
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
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 flex flex-col gap-6">
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Overview</h3>
                            <div className="grid grid-cols-3 gap-6 font-bold text-2xl">
                                <InfoRow label="Email" value={profile.email} />
                                <InfoRow label="Phone" value={profile.phone} />
                                <InfoRow label="Designation" value={profile.designation} />
                                <InfoRow label="Account" value={profile.account?.name} />
                            </div>
                        </div>

                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Open Deals</h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                                    style={{ background: T.primaryDim, color: T.primaryText }}>
                                    {profile.openDeals?.length || 0}
                                </span>
                            </div>
                            {profile.openDeals?.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {profile.openDeals.map(d => {
                                        const s = STAGE_STYLES[d.stage] || STAGE_STYLES.NEW
                                        return (
                                            <div key={d.id} className="flex items-center justify-between p-4 rounded-xl"
                                                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                        style={{ background: T.primaryDim }}>
                                                        <span className="material-symbols-outlined text-[18px]"
                                                            style={{ color: T.primary }}>handshake</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{d.title}</p>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                                                            style={{ background: s.badgeBg, color: s.badgeColor }}>{d.stage}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black" style={{ color: T.primaryText }}>
                                                    ₹{(d.amount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No open deals</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Quick Stats</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { icon: 'handshake', label: 'Open Deals', value: profile.openDealCount, bg: T.primaryDim, color: T.primary },
                                    { icon: 'payments', label: 'Deal Value', value: '₹' + (profile.openDealAmount || 0).toLocaleString(), bg: T.successDim, color: T.success },
                                    { icon: 'event_note', label: 'Activities', value: profile.recentActivities?.length || 0, bg: T.secondaryDim, color: T.secondaryText },
                                ].map(({ icon, label, value, bg, color }) => (
                                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: T.surfaceRaised }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: bg }}>
                                            <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                                            <p className="text-lg font-black" style={{ color: T.textPrimary }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Recent Activity</h3>
                            {profile.recentActivities?.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {profile.recentActivities.map(a => {
                                        const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                                        return (
                                            <div key={a.id} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ background: s.bg }}>
                                                    <span className="material-symbols-outlined text-[15px]"
                                                        style={{ color: s.color }}>{s.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[12px] font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                                                    <p className="text-[11px]" style={{ color: T.textMuted }}>{timeAgo(a.createdAt)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : <p className="text-sm text-center py-4" style={{ color: T.textMuted }}>No recent activity</p>}
                        </div>
                    </div>
                </div>
            </main>

            {/* Call Widget */}
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
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, ACTIVITY_STYLES, STAGE_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'
import { getStatus, STATUS_STYLES, fmtScheduled, OUTCOMES } from '../components/activities/activityUtils'
import { timeAgo } from '../utils/date'

const InfoRow = ({ label, value, children }) => (
    <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        {children ?? (
            <p className="text-sm font-semibold" style={{ color: value ? T.textPrimary : T.border }}>
                {value || 'Not provided'}
            </p>
        )}
    </div>
)

export default function ActivityProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const [activity, setActivity] = useState(null)
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState(false)

    const load = () => {
        const controller = new AbortController()
        setLoading(true)
        api.get(`/api/activities/${id}`, { suppressErrorToast: true, signal: controller.signal })
            .then(r => setActivity(r.data))
            .catch(err => { if (!controller.signal.aborted) setActivity(null) })
            .finally(() => { if (!controller.signal.aborted) setLoading(false) })
        return controller
    }

    useEffect(() => {
        const controller = load()
        return () => controller.abort()
    }, [id])

    const toggleComplete = async () => {
        if (!activity) return
        setCompleting(true)
        try {
            const r = await api.patch(`/api/activities/${activity.id}/complete`, { completed: !activity.completed })
            setActivity(r.data)
        } finally { setCompleting(false) }
    }

    // ── Loading skeleton ──────────────────────────────────────
    if (loading) return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <Skeleton height={14} width={120} borderRadius={6} className="mb-6" />
                <div className="rounded-2xl p-6 mb-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-start gap-5">
                        <Skeleton circle width={56} height={56} />
                        <div className="flex-1">
                            <Skeleton height={24} width={280} borderRadius={8} />
                            <Skeleton height={14} width={160} borderRadius={6} className="mt-2" />
                            <div className="flex gap-2 mt-3">
                                <Skeleton height={24} width={80} borderRadius={999} />
                                <Skeleton height={24} width={80} borderRadius={999} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <Skeleton height={180} borderRadius={16} />
                    </div>
                    <Skeleton height={280} borderRadius={16} />
                </div>
            </main>
        </div>
    )

    // ── Not found ─────────────────────────────────────────────
    if (!activity) return (
        <div>
            <TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>event_note</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>Activity not found</p>
                    <p className="text-[12px]" style={{ color: T.textMuted }}>It may have been deleted or you don't have access.</p>
                    <button onClick={() => navigate(-1)} className="crm-btn-ghost text-sm mt-1">← Back to Activities</button>
                </div>
            </div>
        </div>
    )

    const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
    const status = getStatus(activity.scheduledAt, activity.completed)
    const ss = STATUS_STYLES[status]
    const outcomes = OUTCOMES[activity.type] || []

    const fmtDate = (str) => {
        if (!str) return '—'
        return new Date(str).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6 text-sm font-semibold hover:underline"
                    style={{ color: T.primary }}>
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Activities
                </button>

                {/* ── Header card ───────────────────────────────────── */}
                <div className="rounded-2xl p-6 mb-6"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                            {/* Type icon */}
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ background: s.bg }}>
                                <span className="material-symbols-outlined text-[26px]" style={{ color: s.color }}>
                                    {s.icon}
                                </span>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-black"
                                        style={{
                                            color: T.textPrimary, letterSpacing: '-0.01em',
                                            textDecoration: activity.completed ? 'line-through' : 'none',
                                            opacity: activity.completed ? 0.6 : 1
                                        }}>
                                        {activity.subject || 'Untitled Activity'}
                                    </h1>
                                    {/* Type badge */}
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold"
                                        style={{ background: s.bg, color: s.color }}>
                                        {activity.type}
                                    </span>
                                    {/* Status badge */}
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold"
                                        style={{ background: ss.bg, color: ss.color }}>
                                        {ss.label}
                                    </span>
                                </div>

                                {activity.description && (
                                    <p className="text-sm mt-2 max-w-2xl" style={{ color: T.textSecondary }}>
                                        {activity.description}
                                    </p>
                                )}

                                <p className="text-[12px] mt-3" style={{ color: T.textMuted }}>
                                    Logged {timeAgo(activity.createdAt)}
                                    {activity.createdAt && ` · ${fmtDate(activity.createdAt)}`}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={toggleComplete}
                                disabled={completing}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                style={{
                                    background: activity.completed ? T.successDim : T.primaryDim,
                                    color: activity.completed ? T.success : T.primary,
                                    border: `1px solid ${activity.completed ? T.success + '40' : T.primary + '40'}`
                                }}>
                                <span className="material-symbols-outlined text-[16px]">
                                    {activity.completed ? 'undo' : 'check_circle'}
                                </span>
                                {completing ? 'Saving...' : activity.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Main grid ─────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-6">

                    {/* Left col — details */}
                    <div className="col-span-2 flex flex-col gap-6">

                        {/* Details card */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Activity Details</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <InfoRow label="Type" value={activity.type} />
                                <InfoRow label="Status" >
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold w-fit"
                                        style={{ background: ss.bg, color: ss.color }}>
                                        {ss.label}
                                    </span>
                                </InfoRow>
                                <InfoRow label="Scheduled At" value={fmtScheduled(activity.scheduledAt)} />
                                <InfoRow label="Created At" value={fmtDate(activity.createdAt)} />
                                <InfoRow label="Outcome">
                                    {activity.outcome ? (
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold w-fit"
                                            style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                            {activity.outcome}
                                        </span>
                                    ) : (
                                        <p className="text-sm font-semibold" style={{ color: T.border }}>Not set</p>
                                    )}
                                </InfoRow>
                                <InfoRow label="Completed">
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold w-fit"
                                        style={{
                                            background: activity.completed ? T.successDim : T.errorDim,
                                            color: activity.completed ? T.success : T.error
                                        }}>
                                        {activity.completed ? 'Yes' : 'No'}
                                    </span>
                                </InfoRow>
                            </div>

                            {activity.description && (
                                <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2"
                                        style={{ color: T.textMuted }}>Description</p>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap"
                                        style={{ color: T.textSecondary }}>
                                        {activity.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Related entities */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Related To</h3>
                            <div className="flex flex-col gap-3">

                                {/* Account */}
                                {activity.account ? (
                                    <button
                                        onClick={() => navigate(`/accounts/${activity.account.id}`)}
                                        className="flex items-center gap-4 p-4 rounded-xl transition-colors text-left w-full"
                                        style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                        onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                            style={{ background: T.primaryDim, color: T.primary }}>
                                            {activity.account.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                                style={{ color: T.textMuted }}>Account</p>
                                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                {activity.account.name}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>
                                            arrow_forward
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 p-4 rounded-xl"
                                        style={{ background: T.surfaceRaised, border: `1px dashed ${T.border}` }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: T.borderSubtle }}>
                                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.border }}>
                                                business
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                                style={{ color: T.textMuted }}>Account</p>
                                            <p className="text-sm" style={{ color: T.border }}>No account linked</p>
                                        </div>
                                    </div>
                                )}

                                {/* Contact */}
                                {activity.contact ? (
                                    <button
                                        onClick={() => navigate(`/contacts/${activity.contact.id}`)}
                                        className="flex items-center gap-4 p-4 rounded-xl transition-colors text-left w-full"
                                        style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                        onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                            style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                            {activity.contact.firstName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                                style={{ color: T.textMuted }}>Contact</p>
                                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                {activity.contact.firstName} {activity.contact.lastName}
                                            </p>
                                            {activity.contact.designation && (
                                                <p className="text-[11px]" style={{ color: T.textMuted }}>
                                                    {activity.contact.designation}
                                                </p>
                                            )}
                                        </div>
                                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>
                                            arrow_forward
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 p-4 rounded-xl"
                                        style={{ background: T.surfaceRaised, border: `1px dashed ${T.border}` }}>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: T.borderSubtle }}>
                                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.border }}>
                                                person
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                                style={{ color: T.textMuted }}>Contact</p>
                                            <p className="text-sm" style={{ color: T.border }}>No contact linked</p>
                                        </div>
                                    </div>
                                )}

                                {/* Deal */}
                                {activity.deal ? (
                                    <button
                                        onClick={() => navigate(`/deals?highlight=${activity.deal.id}`)}
                                        className="flex items-center gap-4 p-4 rounded-xl transition-colors text-left w-full"
                                        style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                        onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: T.tertiaryDim }}>
                                            <span className="material-symbols-outlined text-[18px]"
                                                style={{ color: T.tertiaryText }}>handshake</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                                style={{ color: T.textMuted }}>Deal</p>
                                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                {activity.deal.title}
                                            </p>
                                            {activity.deal.stage && (() => {
                                                const ds = STAGE_STYLES[activity.deal.stage] || STAGE_STYLES.NEW
                                                return (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 inline-block"
                                                        style={{ background: ds.badgeBg, color: ds.badgeColor }}>
                                                        {activity.deal.stage}
                                                    </span>
                                                )
                                            })()}
                                        </div>
                                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>
                                            arrow_forward
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 p-4 rounded-xl"
                                        style={{ background: T.surfaceRaised, border: `1px dashed ${T.border}` }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: T.borderSubtle }}>
                                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.border }}>
                                                handshake
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                                style={{ color: T.textMuted }}>Deal</p>
                                            <p className="text-sm" style={{ color: T.border }}>No deal linked</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right col — meta */}
                    <div className="flex flex-col gap-6">

                        {/* Created by */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-4" style={{ color: T.textPrimary }}>Created By</h3>
                            {activity.owner ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: T.surfaceRaised }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                        style={{ background: T.primaryDim, color: T.primary }}>
                                        {activity.owner.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>
                                            {activity.owner.name}
                                        </p>
                                        <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                                            {activity.owner.email}
                                        </p>
                                        {activity.owner.role && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                                                style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                                {activity.owner.role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-center py-4" style={{ color: T.textMuted }}>Unknown</p>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-4" style={{ color: T.textPrimary }}>Timeline</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    {
                                        icon: 'add_circle',
                                        label: 'Logged',
                                        value: fmtDate(activity.createdAt),
                                        sub: timeAgo(activity.createdAt),
                                        color: T.primary,
                                        bg: T.primaryDim,
                                    },
                                    activity.scheduledAt && {
                                        icon: 'schedule',
                                        label: 'Scheduled',
                                        value: fmtDate(activity.scheduledAt),
                                        sub: fmtScheduled(activity.scheduledAt),
                                        color: status === 'overdue' ? T.error : T.warning,
                                        bg: status === 'overdue' ? T.errorDim : T.warningDim,
                                    },
                                    activity.completed && {
                                        icon: 'check_circle',
                                        label: 'Completed',
                                        value: 'Yes',
                                        sub: 'Marked done',
                                        color: T.success,
                                        bg: T.successDim,
                                    },
                                ].filter(Boolean).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: item.bg }}>
                                            <span className="material-symbols-outlined text-[15px]"
                                                style={{ color: item.color }}>{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest"
                                                style={{ color: T.textMuted }}>{item.label}</p>
                                            <p className="text-[12px] font-semibold mt-0.5"
                                                style={{ color: T.textPrimary }}>{item.value}</p>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Outcome options reference */}
                        {outcomes.length > 0 && (
                            <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                <h3 className="text-sm font-bold mb-4" style={{ color: T.textPrimary }}>Possible Outcomes</h3>
                                <div className="flex flex-col gap-2">
                                    {outcomes.map(o => (
                                        <div key={o} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                            style={{
                                                background: activity.outcome === o ? T.primaryDim : T.surfaceRaised,
                                                border: `1px solid ${activity.outcome === o ? T.primary + '40' : T.borderSubtle}`,
                                            }}>
                                            {activity.outcome === o && (
                                                <span className="material-symbols-outlined text-[13px]"
                                                    style={{ color: T.primary }}>check</span>
                                            )}
                                            <span className="text-[12px] font-semibold"
                                                style={{ color: activity.outcome === o ? T.primary : T.textSecondary }}>
                                                {o}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
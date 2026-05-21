import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, ACTIVITY_STYLES, STAGE_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'
import { getStatus, STATUS_STYLES, fmtScheduled, OUTCOMES } from '../components/activities/activityUtils'
import { timeAgo } from '../utils/date'

// ── InfoCard ──────────────────────────────────────────────────
const InfoCard = ({ label, children, value }) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        {children ?? (
            <p className="text-sm font-semibold" style={{ color: value ? T.textPrimary : T.textMuted }}>
                {value || 'Not provided'}
            </p>
        )}
    </div>
)

// ── Linked entity row ─────────────────────────────────────────
const LinkedCard = ({ icon, iconBg, iconColor, label, title, subtitle, badge, onClick, empty }) => {
    if (empty) return (
        <div className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: T.borderSubtle, border: `1px dashed ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: T.surfaceHigh }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: T.border }}>{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: T.textMuted }}>{label}</p>
                <p className="text-sm" style={{ color: T.textMuted }}>No {label.toLowerCase()} linked</p>
            </div>
        </div>
    )
    return (
        <button onClick={onClick}
            className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150 text-left w-full group"
            style={{ background: T.borderSubtle, border: `1.5px solid transparent` }}
            onMouseEnter={e => {
                e.currentTarget.style.background = T.primaryFaint
                e.currentTarget.style.borderColor = `${T.primary}30`
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.06)`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = T.borderSubtle
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: iconBg, color: iconColor }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: T.textMuted }}>{label}</p>
                <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{title}</p>
                {subtitle && <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
                {badge}
            </div>
            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                style={{ color: T.primary }}>arrow_forward</span>
        </button>
    )
}

export default function ActivityProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

    // ── State (unchanged) ──────────────────────────────────────
    const [activity, setActivity] = useState(null)
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState(false)

    // ── Load (unchanged) ───────────────────────────────────────
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

    // ── Toggle complete (unchanged) ────────────────────────────
    const toggleComplete = async () => {
        if (!activity) return
        setCompleting(true)
        try {
            const r = await api.patch(`/api/activities/${activity.id}/complete`, { completed: !activity.completed })
            setActivity(r.data)
        } finally { setCompleting(false) }
    }

    const fmtDate = (str) => {
        if (!str) return '—'
        return new Date(str).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    // ── Loading skeleton ───────────────────────────────────────
    if (loading) return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <Skeleton height={14} width={120} borderRadius={6} className="mb-6" />
                <Skeleton height={130} borderRadius={20} className="mb-6" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 flex flex-col gap-5">
                        <Skeleton height={200} borderRadius={16} />
                        <Skeleton height={180} borderRadius={16} />
                    </div>
                    <div className="flex flex-col gap-5">
                        <Skeleton height={120} borderRadius={16} />
                        <Skeleton height={180} borderRadius={16} />
                    </div>
                </div>
            </main>
        </div>
    )

    // ── Not found ──────────────────────────────────────────────
    if (!activity) return (
        <div>
            <TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[30px]"
                            style={{ color: T.primary }}>event_note</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Activity not found</p>
                    <p className="text-[12px]" style={{ color: T.textMuted }}>
                        It may have been deleted or you don't have access.
                    </p>
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group"
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

    const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
    const status = getStatus(activity.scheduledAt, activity.completed)
    const ss = STATUS_STYLES[status]
    const outcomes = OUTCOMES[activity.type] || []

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">

                {/* ── Back button ───────────────────────────── */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group"
                    style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                    Back
                </button>

                {/* ── Hero banner ───────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.sidebar} 0%, #1a3a6b 55%, #0d2d5e 100%)`,
                        minHeight: 130,
                    }}>
                    {/* Accent glow using activity type color */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${s.color}30 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '40%', width: 120, height: 120,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-8 py-7 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            {/* Type icon */}
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: `${s.color}22`,
                                    border: `1.5px solid ${s.color}40`,
                                    boxShadow: `0 0 20px ${s.color}20`,
                                }}>
                                <span className="material-symbols-outlined filled text-[28px]"
                                    style={{ color: s.color }}>{s.icon}</span>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <h1 className="text-2xl font-black"
                                        style={{
                                            color: '#fff',
                                            letterSpacing: '-0.02em',
                                            textDecoration: activity.completed ? 'line-through' : 'none',
                                            opacity: activity.completed ? 0.6 : 1,
                                        }}>
                                        {activity.subject || 'Untitled Activity'}
                                    </h1>
                                    {/* Type badge */}
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                        style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}40` }}>
                                        {activity.type}
                                    </span>
                                    {/* Status badge */}
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                        style={{ background: `${ss.color}22`, color: ss.color, border: `1px solid ${ss.color}40` }}>
                                        {ss.label}
                                    </span>
                                </div>
                                <p className="text-[13px]" style={{ color: 'rgba(147,197,253,0.80)' }}>
                                    Logged {timeAgo(activity.createdAt)}
                                    {activity.createdAt && ` · ${fmtDate(activity.createdAt)}`}
                                </p>
                            </div>
                        </div>

                        {/* Mark complete button (unchanged logic) */}
                        <button
                            onClick={toggleComplete}
                            disabled={completing}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 shrink-0"
                            style={{
                                background: activity.completed
                                    ? 'rgba(34,197,94,0.18)'
                                    : 'rgba(255,255,255,0.12)',
                                color: activity.completed ? '#4ADE80' : '#fff',
                                border: activity.completed
                                    ? '1px solid rgba(34,197,94,0.35)'
                                    : '1px solid rgba(255,255,255,0.22)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = activity.completed
                                ? 'rgba(34,197,94,0.26)'
                                : 'rgba(255,255,255,0.20)'}
                            onMouseLeave={e => e.currentTarget.style.background = activity.completed
                                ? 'rgba(34,197,94,0.18)'
                                : 'rgba(255,255,255,0.12)'}>
                            <span className="material-symbols-outlined text-[16px]">
                                {activity.completed ? 'undo' : 'check_circle'}
                            </span>
                            {completing ? 'Saving...' : activity.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                    </div>
                </div>

                {/* ── Main grid ─────────────────────────────── */}
                <div className="grid grid-cols-3 gap-6">

                    {/* ── Left col — details ────────────────── */}
                    <div className="col-span-2 flex flex-col gap-6">

                        {/* Activity details card */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined filled text-[16px]"
                                    style={{ color: T.primary }}>info</span>
                                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Activity Details</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <InfoCard label="Type">
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="material-symbols-outlined filled text-[14px]"
                                            style={{ color: s.color }}>{s.icon}</span>
                                        <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                                            {activity.type}
                                        </span>
                                    </div>
                                </InfoCard>

                                <InfoCard label="Status">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mt-0.5 w-fit"
                                        style={{ background: ss.bg, color: ss.color }}>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.color }} />
                                        {ss.label}
                                    </span>
                                </InfoCard>

                                <InfoCard label="Scheduled At" value={fmtScheduled(activity.scheduledAt) || '—'} />
                                <InfoCard label="Created At" value={fmtDate(activity.createdAt)} />

                                <InfoCard label="Outcome">
                                    {activity.outcome ? (
                                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold mt-0.5 w-fit"
                                            style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                            {activity.outcome}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold" style={{ color: T.textMuted }}>Not set</span>
                                    )}
                                </InfoCard>

                                <InfoCard label="Completed">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mt-0.5 w-fit"
                                        style={{
                                            background: activity.completed ? T.successDim : T.errorDim,
                                            color: activity.completed ? T.success : T.error,
                                        }}>
                                        <span className="material-symbols-outlined text-[12px]">
                                            {activity.completed ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                        {activity.completed ? 'Yes' : 'No'}
                                    </span>
                                </InfoCard>
                            </div>

                            {/* Description (unchanged logic) */}
                            {activity.description && (
                                <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2"
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
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined filled text-[16px]"
                                    style={{ color: T.primary }}>link</span>
                                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Related To</h3>
                            </div>
                            <div className="flex flex-col gap-3">

                                {/* Account (unchanged navigate logic) */}
                                {activity.account ? (
                                    <LinkedCard
                                        icon={activity.account.name.charAt(0).toUpperCase()}
                                        iconBg={T.primaryDim} iconColor={T.primary}
                                        label="Account"
                                        title={activity.account.name}
                                        onClick={() => navigate(`/accounts/${activity.account.id}`)}
                                    />
                                ) : (
                                    <LinkedCard icon="business" label="Account" empty />
                                )}

                                {/* Contact (unchanged navigate logic) */}
                                {activity.contact ? (
                                    <LinkedCard
                                        icon={activity.contact.firstName?.charAt(0).toUpperCase()}
                                        iconBg={T.secondaryDim} iconColor={T.secondaryText}
                                        label="Contact"
                                        title={`${activity.contact.firstName} ${activity.contact.lastName}`}
                                        subtitle={activity.contact.designation}
                                        onClick={() => navigate(`/contacts/${activity.contact.id}`)}
                                    />
                                ) : (
                                    <LinkedCard icon="person" label="Contact" empty />
                                )}

                                {/* Deal (unchanged navigate logic) */}
                                {activity.deal ? (
                                    <LinkedCard
                                        icon={<span className="material-symbols-outlined filled text-[18px]">handshake</span>}
                                        iconBg={T.tertiaryDim} iconColor={T.tertiaryText}
                                        label="Deal"
                                        title={activity.deal.title}
                                        badge={activity.deal.stage && (() => {
                                            const ds = STAGE_STYLES[activity.deal.stage] || STAGE_STYLES.NEW
                                            return (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                                                    style={{ background: ds.badgeBg, color: ds.badgeColor }}>
                                                    {activity.deal.stage}
                                                </span>
                                            )
                                        })()}
                                        onClick={() => navigate(`/deals?highlight=${activity.deal.id}`)}
                                    />
                                ) : (
                                    <LinkedCard icon="handshake" label="Deal" empty />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right col — meta ──────────────────── */}
                    <div className="flex flex-col gap-6">

                        {/* Created by */}
                        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined filled text-[15px]"
                                    style={{ color: T.primary }}>person</span>
                                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Created By</h3>
                            </div>
                            {activity.owner ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: T.borderSubtle }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${T.primary} 0%, #1D4ED8 100%)`,
                                            color: '#fff',
                                        }}>
                                        {activity.owner.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>
                                            {activity.owner.name}
                                        </p>
                                        <p className="text-[11px] truncate mt-0.5" style={{ color: T.textMuted }}>
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
                        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined filled text-[15px]"
                                    style={{ color: T.primary }}>timeline</span>
                                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Timeline</h3>
                            </div>
                            <div className="flex flex-col">
                                {[
                                    {
                                        icon: 'add_circle',
                                        label: 'Logged',
                                        value: fmtDate(activity.createdAt),
                                        sub: timeAgo(activity.createdAt),
                                        color: T.primary, bg: T.primaryDim,
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
                                        color: T.success, bg: T.successDim,
                                    },
                                ].filter(Boolean).map((item, i, arr) => (
                                    <div key={i} className="flex gap-3 items-start relative">
                                        {/* Connector line */}
                                        {i < arr.length - 1 && (
                                            <div className="absolute left-4 top-8 bottom-0 w-px"
                                                style={{ background: T.border }} />
                                        )}
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                                            style={{ background: item.bg }}>
                                            <span className="material-symbols-outlined filled text-[14px]"
                                                style={{ color: item.color }}>{item.icon}</span>
                                        </div>
                                        <div className="pb-5">
                                            <p className="text-[10px] font-black uppercase tracking-widest"
                                                style={{ color: T.textMuted }}>{item.label}</p>
                                            <p className="text-[12px] font-semibold mt-0.5"
                                                style={{ color: T.textPrimary }}>{item.value}</p>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Possible outcomes (unchanged logic) */}
                        {outcomes.length > 0 && (
                            <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined filled text-[15px]"
                                        style={{ color: T.primary }}>flag</span>
                                    <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Possible Outcomes</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {outcomes.map(o => (
                                        <div key={o}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
                                            style={{
                                                background: activity.outcome === o ? T.primaryDim : T.borderSubtle,
                                                border: `1.5px solid ${activity.outcome === o ? T.primary + '40' : 'transparent'}`,
                                            }}>
                                            <span className="material-symbols-outlined text-[14px]"
                                                style={{ color: activity.outcome === o ? T.primary : T.textMuted }}>
                                                {activity.outcome === o ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
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
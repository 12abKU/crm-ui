import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { T, ACTIVITY_TYPES, ACTIVITY_STYLES, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import InlineEdit from '../components/InlineEdit'
import Pagination from '../components/Pagination'
import SearchableSelect from '../components/SearchableSelect'
import { Input, Select } from '../components/FormField'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

const PAGE_SIZE = 20

// ── Outcome options per type ──────────────────────────────────
const OUTCOMES = {
    CALL: ['Answered', 'No answer', 'Left voicemail', 'Wrong number'],
    EMAIL: ['Replied', 'No reply', 'Bounced', 'Out of office'],
    MEETING: ['Completed', 'No show', 'Rescheduled', 'Cancelled'],
    NOTE: ['Noted'],
}

const getStatus = (scheduledAt, completed) => {
    if (completed) return 'done'
    if (!scheduledAt) return 'logged'
    const diff = new Date(scheduledAt) - new Date()
    const hours = diff / 3600000
    if (diff < 0) return 'overdue'
    if (hours < 24) return 'today'
    return 'upcoming'
}

const STATUS_STYLES = {
    done: { label: 'Done', bg: 'rgba(22,163,74,0.10)', color: '#16A34A' },
    overdue: { label: 'Overdue', bg: 'rgba(220,38,38,0.10)', color: '#DC2626' },
    today: { label: 'Due today', bg: 'rgba(217,119,6,0.12)', color: '#D97706' },
    upcoming: { label: 'Upcoming', bg: 'rgba(22,163,74,0.10)', color: '#16A34A' },
    logged: { label: 'Logged', bg: 'rgba(120,113,108,0.12)', color: '#78716C' },
}

const fmtScheduled = (s) => {
    if (!s) return '—'
    const d = new Date(s)
    const now = new Date()
    const diffDays = Math.floor((d - now) / 86400000)
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 0) return `Today ${time}`
    if (diffDays === 1) return `Tomorrow ${time}`
    if (diffDays === -1) return `Yesterday ${time}`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + time
}

const fmtTimelineGroup = (dateStr) => {
    if (!dateStr) return 'No date'
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'long' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Outcome Badge ─────────────────────────────────────────────
function OutcomePicker({ activityId, type, current, onSave }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const options = OUTCOMES[type] || []

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(o => !o)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                style={{ background: current ? T.secondaryDim : T.surfaceHigh, color: current ? T.secondary : T.textMuted }}>
                <span className="material-symbols-outlined text-[11px]">flag</span>
                {current || 'Set outcome'}
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 rounded-xl shadow-lg z-50 py-1 min-w-[160px]"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    {options.map(opt => (
                        <button key={opt} onClick={() => { onSave(activityId, opt); setOpen(false) }}
                            className="w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors"
                            style={{ color: opt === current ? T.secondary : T.textPrimary }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {opt}
                        </button>
                    ))}
                    {current && (
                        <button onClick={() => { onSave(activityId, null); setOpen(false) }}
                            className="w-full text-left px-3 py-2 text-[11px] transition-colors"
                            style={{ color: T.textMuted, borderTop: `1px solid ${T.border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Clear outcome
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Complete Toggle ───────────────────────────────────────────
function CompleteToggle({ activityId, completed, onToggle }) {
    const [hovered, setHovered] = useState(false)

    return (
        <button
            onClick={() => onToggle(activityId, !completed)}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
                borderColor: completed ? T.success : hovered ? T.success : T.border,
                background: completed ? T.success : hovered ? 'rgba(22,163,74,0.15)' : 'transparent',
            }}>
            {(completed || hovered) && (
                <span className="material-symbols-outlined"
                    style={{
                        fontSize: 12,
                        color: completed ? '#fff' : T.success,
                    }}>
                    check
                </span>
            )}
        </button>
    )
}


// ── Today's Focus Box ─────────────────────────────────────────
function TodayFocus({ overdue, upcoming, loading }) {




    if (loading) return (
        <div className="rounded-2xl p-5 mb-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <Skeleton height={14} width={160} borderRadius={6} className="mb-4" />
            <div className="flex gap-3">
                {[1, 2, 3].map(i => <Skeleton key={i} height={80} borderRadius={12} className="flex-1" />)}
            </div>
        </div>
    )

    if (overdue.length === 0 && upcoming.length === 0) return (
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.10)' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: T.success }}>task_alt</span>
            </div>
            <div>
                <p className="text-sm font-black" style={{ color: T.textPrimary }}>All caught up!</p>
                <p className="text-[12px]" style={{ color: T.textMuted }}>No overdue or upcoming tasks</p>
            </div>
        </div>
    )

    const TaskCard = ({ a, accent }) => {
        const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
        const status = getStatus(a.scheduledAt, a.completed)
        const ss = STATUS_STYLES[status]
        return (
            <div className="flex-1 p-4 rounded-xl flex flex-col gap-2 min-w-0"
                style={{
                    background: accent === 'red' ? 'rgba(220,38,38,0.06)' : T.primaryDim,
                    border: `1px solid ${accent === 'red' ? 'rgba(220,38,38,0.20)' : T.primary + '30'}`,
                }}>
                <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: s.bg, color: s.color }}>
                        <span className="material-symbols-outlined text-[11px]">{s.icon}</span>
                        {a.type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: ss.bg, color: ss.color }}>
                        {ss.label}
                    </span>
                </div>
                <p className="text-sm font-bold leading-tight truncate" style={{ color: T.textPrimary }}>
                    {a.subject}
                </p>
                {a.account && (
                    <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                        <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">business</span>
                        {a.account.name}
                    </p>
                )}
                <p className="text-[11px] font-semibold mt-auto"
                    style={{ color: accent === 'red' ? T.error : T.primary }}>
                    <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">schedule</span>
                    {fmtScheduled(a.scheduledAt)}
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl p-5 mb-6 flex flex-col gap-5"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>

            {/* Overdue section */}
            {overdue.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.error }}>error</span>
                        <p className="text-[12px] font-black" style={{ color: T.error }}>Overdue</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(220,38,38,0.10)', color: T.error }}>
                            {overdue.length}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {overdue.map(a => <TaskCard key={a.id} a={a} accent="red" />)}
                    </div>
                </div>
            )}

            {/* Divider */}
            {overdue.length > 0 && upcoming.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.border}` }} />
            )}

            {/* Upcoming section */}
            {upcoming.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>bolt</span>
                        <p className="text-[12px] font-black" style={{ color: T.primary }}>Up Next</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {upcoming.length}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {upcoming.map(a => <TaskCard key={a.id} a={a} accent="blue" />)}
                    </div>
                </div>
            )}
        </div>
    )
}





// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, loading, accent }) {
    return (
        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: accent ? accent + '20' : T.primaryDim }}>
                    <span className="material-symbols-outlined text-[18px]"
                        style={{ color: accent || T.primary }}>{icon}</span>
                </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>{label}</p>
            {loading
                ? <Skeleton height={30} width={80} borderRadius={8} />
                : <p className="text-2xl font-black" style={{ color: accent || T.textPrimary }}>{value ?? '—'}</p>
            }
            {sub && <p className="text-[11px] mt-1" style={{ color: T.textMuted }}>{sub}</p>}
        </div>
    )
}

// ── My Tasks Panel ────────────────────────────────────────────
function MyTasksPanel({ onComplete, onOutcome }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const r = await api.get('/api/activities/my-tasks')
            setTasks(r.data ?? [])
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [])

    const handleComplete = async (id, val) => {
        await onComplete(id, val)
        setTasks(t => t.filter(x => x.id !== id))
    }

    if (loading) return (
        <div className="flex flex-col gap-3 p-2">
            {[1, 2, 3].map(i => <Skeleton key={i} height={60} borderRadius={12} />)}
        </div>
    )

    if (tasks.length === 0) return (
        <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: T.successDim || 'rgba(22,163,74,0.10)' }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: T.success }}>task_alt</span>
            </div>
            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>All caught up!</p>
            <p className="text-[12px]" style={{ color: T.textMuted }}>No pending tasks</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-2">
            {tasks.map(a => {
                const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                const status = getStatus(a.scheduledAt, a.completed)
                const ss = STATUS_STYLES[status]
                return (
                    <div key={a.id} className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <CompleteToggle activityId={a.id} completed={a.completed} onToggle={handleComplete} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: s.bg, color: s.color }}>{a.type}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                            {a.account && (
                                <p className="text-[11px]" style={{ color: T.textMuted }}>{a.account.name}</p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <p className="text-[11px]" style={{ color: status === 'overdue' ? T.error : T.textMuted }}>
                                {fmtScheduled(a.scheduledAt)}
                            </p>
                            <OutcomePicker activityId={a.id} type={a.type} current={a.outcome}
                                onSave={(id, val) => { onOutcome(id, val); setTasks(t => t.map(x => x.id === id ? { ...x, outcome: val } : x)) }} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Activity Table Row ────────────────────────────────────────
function ActivityRow({ a, highlighted, rowBg, onRemove, onUpdate, onComplete, onOutcome, loadCount }) {
    const [blink, setBlink] = useState(false)
    const rowRef = useRef(null)
    const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
    const status = getStatus(a.scheduledAt, a.completed)
    const ss = STATUS_STYLES[status]

    useEffect(() => {
        if (!highlighted) return
        setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
        const t = setTimeout(() => {
            setBlink(true)
            setTimeout(() => { setBlink(false); setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 500) }, 500) }, 500)
        }, 300)
        return () => clearTimeout(t)
    }, [highlighted])

    return (
        <tr ref={rowRef} className="group transition-all"
            style={{
                borderBottom: `1px solid ${T.borderSubtle}`,
                background: blink ? 'rgba(37,99,235,0.18)' : a.completed ? T.surfaceRaised : rowBg,
                opacity: a.completed ? 0.65 : 1,
                transition: 'background 0.3s ease',
            }}
            onMouseEnter={e => { if (!blink) e.currentTarget.style.background = T.surfaceHigh }}
            onMouseLeave={e => { if (!blink) e.currentTarget.style.background = a.completed ? T.surfaceRaised : rowBg }}>

            {/* Complete toggle */}
            <td className="px-4 py-3.5">
                <CompleteToggle activityId={a.id} completed={a.completed} onToggle={onComplete} />
            </td>

            {/* Type */}
            <td className="px-4 py-3.5">
                <InlineEdit value={a.type} options={ACTIVITY_TYPES} onSave={v => onUpdate(a.id, 'type', v)}>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold w-fit"
                        style={{ background: s.bg, color: s.color }}>
                        <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                        {a.type}
                    </span>
                </InlineEdit>
            </td>

            {/* Subject */}
            <td className="px-4 py-3.5">
                <InlineEdit value={a.subject} placeholder="Add subject" onSave={v => onUpdate(a.id, 'subject', v)}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary, textDecoration: a.completed ? 'line-through' : 'none' }}>
                        {a.subject}
                    </p>
                </InlineEdit>
                {a.description && (
                    <p className="text-[11px] mt-0.5 truncate max-w-[180px]" style={{ color: T.textMuted }}>{a.description}</p>
                )}
                {/* Outcome under subject */}
                <OutcomePicker activityId={a.id} type={a.type} current={a.outcome} onSave={onOutcome} />
            </td>

            {/* Account · Contact */}
            <td className="px-4 py-3.5">
                {a.account ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                            style={{ background: T.primaryDim, color: T.primaryText }}>
                            {a.account.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] font-semibold truncate" style={{ color: T.textPrimary }}>{a.account.name}</p>
                            {a.contact && (
                                <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                                    {a.contact.firstName} {a.contact.lastName}
                                </p>
                            )}
                        </div>
                    </div>
                ) : <span className="text-[12px]" style={{ color: T.textMuted }}>—</span>}
            </td>

            {/* Scheduled */}
            <td className="px-4 py-3.5 text-[12px]"
                style={{ color: status === 'overdue' ? T.error : T.textSecondary, fontWeight: status === 'overdue' ? 700 : 400 }}>
                {fmtScheduled(a.scheduledAt)}
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
            </td>

            {/* Delete */}
            <td className="px-4 py-3.5">
                <button onClick={() => onRemove(a.id)}
                    className="material-symbols-outlined text-[17px] opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                    delete
                </button>
            </td>
        </tr>
    )
}

// ── Timeline View ─────────────────────────────────────────────
function TimelineView({ activities, loading, onComplete, onOutcome }) {
    if (loading) return (
        <div className="flex flex-col gap-5 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <Skeleton circle width={32} height={32} />
                    <div className="flex-1">
                        <Skeleton height={13} width={200} borderRadius={6} />
                        <Skeleton height={11} width={140} borderRadius={6} className="mt-1.5" />
                    </div>
                </div>
            ))}
        </div>
    )

    if (activities.length === 0) return (
        <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>event_note</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No activities yet</p>
        </div>
    )

    const groups = []
    let currentLabel = null
    activities.forEach(a => {
        const label = fmtTimelineGroup(a.scheduledAt || a.createdAt)
        if (label !== currentLabel) { groups.push({ label, items: [] }); currentLabel = label }
        groups[groups.length - 1].items.push(a)
    })

    return (
        <div className="p-6">
            {groups.map((group, gi) => (
                <div key={gi} className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px" style={{ background: T.border }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2" style={{ color: T.textMuted }}>
                            {group.label}
                        </span>
                        <div className="flex-1 h-px" style={{ background: T.border }} />
                    </div>
                    <div className="flex flex-col">
                        {group.items.map((a, idx) => {
                            const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                            const status = getStatus(a.scheduledAt, a.completed)
                            const ss = STATUS_STYLES[status]
                            const isLast = idx === group.items.length - 1
                            return (
                                <div key={a.id} className="flex gap-3 items-start relative"
                                    style={{ opacity: a.completed ? 0.6 : 1 }}>
                                    {!isLast && <div className="absolute left-4 top-8 bottom-0 w-px" style={{ background: T.border }} />}
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                                        style={{ background: a.completed ? T.successDim || 'rgba(22,163,74,0.10)' : s.bg }}>
                                        <span className="material-symbols-outlined text-[14px]"
                                            style={{ color: a.completed ? T.success : s.color }}>
                                            {a.completed ? 'task_alt' : s.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 pb-5 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold"
                                                    style={{ color: T.textPrimary, textDecoration: a.completed ? 'line-through' : 'none' }}>
                                                    {a.subject || '—'}
                                                </p>
                                                {a.description && (
                                                    <p className="text-[12px] mt-0.5" style={{ color: T.textSecondary }}>{a.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    {a.account && (
                                                        <span className="flex items-center gap-1 text-[11px]" style={{ color: T.textMuted }}>
                                                            <span className="material-symbols-outlined text-[11px]">business</span>
                                                            {a.account.name}
                                                        </span>
                                                    )}
                                                    {a.contact && (
                                                        <span className="flex items-center gap-1 text-[11px]" style={{ color: T.textMuted }}>
                                                            <span className="material-symbols-outlined text-[11px]">person</span>
                                                            {a.contact.firstName} {a.contact.lastName}
                                                        </span>
                                                    )}
                                                    <OutcomePicker activityId={a.id} type={a.type} current={a.outcome} onSave={onOutcome} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                <span className="text-[11px]" style={{ color: status === 'overdue' ? T.error : T.textMuted }}>
                                                    {fmtScheduled(a.scheduledAt || a.createdAt)}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                                                <CompleteToggle activityId={a.id} completed={a.completed} onToggle={onComplete} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────
export default function Activities() {
    const [activities, setActivities] = useState([])
    const [accounts, setAccounts] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [filterAccountId, setFilterAccountId] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [viewMode, setViewMode] = useState('table') // 'table' | 'timeline' | 'tasks'
    const [loadCount, setLoadCount] = useState(0)
    const [allTasks, setAllTasks] = useState([])


    const [form, setForm] = useState({
        type: 'CALL', subject: '', description: '', scheduledAt: '',
        accountId: '', contactId: '', dealId: ''
    })


    const loadAllTasks = useCallback(async () => {
        const r = await api.get('/api/activities/my-tasks')
        setAllTasks(r.data ?? [])
    }, [])

    const [filteredContacts, setFilteredContacts] = useState([])
    const [filteredDeals, setFilteredDeals] = useState([])
    const [loadingRelated, setLoadingRelated] = useState(false)

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')
    const initialLoad = useRef(true)


    const stats = useMemo(() => {
        const now = new Date()
        const overdue = allTasks.filter(a => !a.completed && a.scheduledAt && new Date(a.scheduledAt) < now).length
        const dueToday = allTasks.filter(a => {
            if (!a.scheduledAt || a.completed) return false
            const d = new Date(a.scheduledAt)
            const n = new Date()
            return d >= new Date(n.setHours(0, 0, 0, 0)) && d <= new Date(n.setHours(23, 59, 59, 999))
        }).length
        const done = activities.filter(a => a.completed).length
        const pending = allTasks.filter(a => !a.completed && a.scheduledAt).length
        return { overdue, dueToday, done, pending }
    }, [allTasks, activities])

    // ← separate, outside stats
    const { overdueList, upcomingList } = useMemo(() => {
        const now = new Date()
        const overdueList = allTasks
            .filter(a => !a.completed && a.scheduledAt && new Date(a.scheduledAt) < now)
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        const upcomingList = allTasks
            .filter(a => !a.completed && a.scheduledAt && new Date(a.scheduledAt) >= now)
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
            .slice(0, 3)
        return { overdueList, upcomingList }
    }, [allTasks])



    const displayActivities = useMemo(() => {
        if (typeFilter === 'ALL') return activities
        return activities.filter(a => a.type === typeFilter)
    }, [activities, typeFilter])

    const loadPage = async (pageNum, accountId, q = '') => {
        setLoading(true)
        try {
            let url
            if (accountId) {
                url = `/api/activities/account/${accountId}?page=${pageNum}&size=${PAGE_SIZE}`
            } else {
                const params = new URLSearchParams({ page: pageNum, size: PAGE_SIZE })
                if (q.trim()) params.set('search', q.trim())
                url = `/api/activities?${params}`
            }
            const r = await api.get(url)
            setActivities(r.data.content ?? [])
            setTotalPages(r.data.totalPages)
            setTotalElements(r.data.totalElements)
        } finally {
            setLoading(false)
            setLoadCount(c => c + 1)
        }
    }

    useEffect(() => {
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content ?? []))
        loadAllTasks()  // ← use the function instead of inline

        if (highlightId) {
            api.get(`/api/activities/position/${highlightId}?size=${PAGE_SIZE}`)
                .then(r => { const p = r.data.page ?? 0; setPage(p); loadPage(p, '') })
                .catch(() => loadPage(0, ''))
        } else {
            loadPage(0, '')
        }
    }, [])

    useEffect(() => {
        if (filterAccountId) return
        if (initialLoad.current) { initialLoad.current = false; return }
        const t = setTimeout(() => { setPage(0); loadPage(0, '', search) }, 350)
        return () => clearTimeout(t)
    }, [search])

    const goToPage = (p) => { setPage(p); loadPage(p, filterAccountId, search) }

    const onFilterChange = (accountId) => {
        setFilterAccountId(accountId); setSearch(''); setPage(0); loadPage(0, accountId, '')
    }

    const onFormAccountChange = async (accountId) => {
        setForm(f => ({ ...f, accountId, contactId: '', dealId: '' }))
        setFilteredContacts([]); setFilteredDeals([])
        if (!accountId) return
        setLoadingRelated(true)
        try {
            const r = await api.get(`/api/accounts/${accountId}/profile`)
            setFilteredContacts((r.data.contacts ?? []).map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` })))
            setFilteredDeals((r.data.openDeals ?? []).map(d => ({ id: d.id, label: d.title })))
        } finally { setLoadingRelated(false) }
    }

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/api/activities', {
            ...form,
            accountId: form.accountId || null,
            contactId: form.contactId || null,
            dealId: form.dealId || null
        })
        setOpen(false)
        setForm({ type: 'CALL', subject: '', description: '', scheduledAt: '', accountId: '', contactId: '', dealId: '' })
        setFilteredContacts([]); setFilteredDeals([])
        setPage(0); loadPage(0, filterAccountId, search)
    }

    const remove = async (id) => {
        await api.delete(`/api/activities/${id}`)
        const newTotal = totalElements - 1
        const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1)
        const targetPage = Math.min(page, maxPage)
        setPage(targetPage); loadPage(targetPage, filterAccountId, search)
        loadAllTasks()  // ← add this

    }

    const updateActivity = async (id, field, value) => {
        const a = activities.find(x => x.id === id)
        await api.put(`/api/activities/${id}`, {
            type: a.type, subject: a.subject, description: a.description,
            scheduledAt: a.scheduledAt, [field]: value
        })
        setActivities(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))
    }

    const toggleComplete = async (id, completed) => {
        await api.patch(`/api/activities/${id}/complete`, { completed })
        setActivities(p => p.map(x => x.id === id ? { ...x, completed } : x))
        loadAllTasks()  // ← add this

    }

    const saveOutcome = async (id, outcome) => {
        await api.patch(`/api/activities/${id}/outcome`, { outcome })
        setActivities(p => p.map(x => x.id === id ? { ...x, outcome } : x))
        loadAllTasks()  // ← add this

    }

    const TYPE_FILTER_ICONS = { CALL: 'call', EMAIL: 'mail', MEETING: 'groups', NOTE: 'sticky_note_2' }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-[1440px] mx-auto">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>
                            Activities
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                            {totalElements} logged
                            {stats.overdue > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{ background: 'rgba(220,38,38,0.10)', color: '#DC2626' }}>
                                    {stats.overdue} overdue
                                </span>
                            )}
                        </p>
                    </div>
                    <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add</span>Log Activity
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <StatCard icon="warning" label="Overdue" value={loading ? '—' : stats.overdue}
                        sub="need follow-up" loading={loading} accent="#DC2626" />
                    <StatCard icon="today" label="Due today" value={loading ? '—' : stats.dueToday}
                        sub="scheduled today" loading={loading} accent="#D97706" />
                    <StatCard icon="task_alt" label="Completed" value={loading ? '—' : stats.done}
                        sub="on this page" loading={loading} accent={T.success} />
                    <StatCard icon="pending_actions" label="Pending" value={loading ? '—' : stats.pending}
                        sub="scheduled, open" loading={loading} />
                </div>


                {/* ── ADD THIS ── */}
                <TodayFocus overdue={overdueList} upcoming={upcomingList} loading={loading} />


                {/* ── View Tabs ── */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        {[
                            { mode: 'table', icon: 'table_rows', label: 'All Activities' },
                            { mode: 'tasks', icon: 'checklist', label: 'My Tasks' },
                            { mode: 'timeline', icon: 'timeline', label: 'Timeline' },
                        ].map(({ mode, icon, label }) => (
                            <button key={mode} onClick={() => setViewMode(mode)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                                style={{
                                    background: viewMode === mode ? T.primary : 'transparent',
                                    color: viewMode === mode ? '#fff' : T.textMuted,
                                }}>
                                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Filters — only for table/timeline */}
                    {viewMode !== 'tasks' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ background: T.surface, border: `1px solid ${T.border}`, minWidth: 200 }}>
                                <span className="material-symbols-outlined text-[17px]" style={{ color: T.textMuted }}>search</span>
                                <input type="text" value={search}
                                    onChange={e => { setSearch(e.target.value); setFilterAccountId('') }}
                                    placeholder="Search activities..."
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: T.textPrimary }} />
                                {search && (
                                    <span onClick={() => setSearch('')}
                                        className="material-symbols-outlined text-[15px] cursor-pointer"
                                        style={{ color: T.textMuted }}>close</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                {['ALL', ...ACTIVITY_TYPES].map(t => {
                                    const isActive = typeFilter === t
                                    const s = ACTIVITY_STYLES[t]
                                    return (
                                        <button key={t} onClick={() => setTypeFilter(t)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                            style={{
                                                background: isActive ? (t === 'ALL' ? T.primary : s?.bg) : 'transparent',
                                                color: isActive ? (t === 'ALL' ? '#fff' : s?.color) : T.textMuted,
                                            }}>
                                            {t !== 'ALL' && <span className="material-symbols-outlined text-[12px]">{s?.icon}</span>}
                                            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                                        </button>
                                    )
                                })}
                            </div>
                            <SearchableSelect value={filterAccountId} onChange={onFilterChange}
                                options={[{ id: '', label: 'All Accounts' }, ...accounts.map(a => ({ id: String(a.id), label: a.name }))]}
                                placeholder="Filter by account..." />
                        </div>
                    )}
                </div>

                {/* ── Content ── */}
                {viewMode === 'tasks' ? (
                    <MyTasksPanel onComplete={toggleComplete} onOutcome={saveOutcome} />
                ) : (
                    <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        {viewMode === 'table' ? (
                            <>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                            {['', 'Type', 'Subject · Outcome', 'Account · Contact', 'Scheduled', 'Status', ''].map((h, i) => (
                                                <th key={i} className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                                    style={{ color: T.textMuted }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            Array.from({ length: 8 }).map((_, i) => (
                                                <tr key={i} style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                                    {[20, 80, 160, 130, 100, 70, 20].map((w, j) => (
                                                        <td key={j} className="px-4 py-3.5">
                                                            <Skeleton height={14} width={w} borderRadius={6} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : displayActivities.map((a, i) => {
                                            const isHighlighted = String(a.id) === highlightId
                                            return (
                                                <ActivityRow
                                                    key={isHighlighted ? `${a.id}-${loadCount}` : a.id}
                                                    a={a}
                                                    rowBg={ROW_COLORS[i % ROW_COLORS.length]}
                                                    highlighted={isHighlighted}
                                                    onRemove={remove}
                                                    onUpdate={updateActivity}
                                                    onComplete={toggleComplete}
                                                    onOutcome={saveOutcome}
                                                />
                                            )
                                        })}
                                        {!loading && displayActivities.length === 0 && (
                                            <tr><td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>event_note</span>
                                                    </div>
                                                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No activities yet</p>
                                                </div>
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination page={page} totalPages={totalPages}
                                    totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />
                            </>
                        ) : (
                            <TimelineView activities={displayActivities} loading={loading}
                                onComplete={toggleComplete} onOutcome={saveOutcome} />
                        )}
                    </div>
                )}
            </main>

            {/* ── Log Activity Form ── */}
            <SlideForm title="Log Activity" open={open}
                onClose={() => {
                    setOpen(false)
                    setFilteredContacts([]); setFilteredDeals([])
                    setForm({ type: 'CALL', subject: '', description: '', scheduledAt: '', accountId: '', contactId: '', dealId: '' })
                }}
                onSubmit={submit}>
                <Select label="Type" value={form.type} onChange={e => setF('type', e.target.value)}>
                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Input label="Subject *" value={form.subject} onChange={e => setF('subject', e.target.value)}
                    placeholder="Initial discussion" required />
                <Input label="Description" value={form.description} onChange={e => setF('description', e.target.value)}
                    placeholder="Details..." />
                <Input label="Scheduled At" type="datetime-local" value={form.scheduledAt}
                    onChange={e => setF('scheduledAt', e.target.value)} />
                <SearchableSelect label="Account" value={form.accountId} onChange={onFormAccountChange}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))} placeholder="Select account" />
                <SearchableSelect label="Contact" value={form.contactId} onChange={v => setF('contactId', v)}
                    options={filteredContacts}
                    placeholder={form.accountId ? 'Select contact' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingRelated} />
                <SearchableSelect label="Deal" value={form.dealId} onChange={v => setF('dealId', v)}
                    options={filteredDeals}
                    placeholder={form.accountId ? 'Select deal' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingRelated} />
            </SlideForm>
        </div>
    )
}
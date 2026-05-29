import { useState } from 'react'
import { T, ACTIVITY_TYPES, ACTIVITY_STYLES } from '../../constants/theme'
import Skeleton from 'react-loading-skeleton'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'
import api from '../../api'

// ── Constants (unchanged) ──────────────────────────────────────
const EMPTY_FORM = { type: 'CALL', subject: '', description: '', scheduledAt: '' }

const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'Yesterday' : `${d}d ago`
}

export default function DealPanelActivities({ activities: initialActivities, loading, deal, onActivityAdded }) {
    const [activities, setActivities] = useState(initialActivities ?? [])
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Sync if parent refreshes (unchanged)
    if (initialActivities && initialActivities !== activities && !adding) {
        setActivities(initialActivities)
    }

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    // ── Submit handler (unchanged) ─────────────────────────────
    const submit = async () => {
        if (!form.subject.trim()) { setError('Subject is required'); return }
        setSaving(true)
        setError('')
        try {
            const res = await api.post('/api/activities', {
                type: form.type,
                subject: form.subject.trim(),
                description: form.description.trim() || null,
                scheduledAt: form.scheduledAt || null,
                dealId: deal.id,
                accountId: deal.account?.id || null,
                contactId: deal.contact?.id || null,
            })
            const newActivity = res.data
            setActivities(prev => [newActivity, ...prev])
            setForm(EMPTY_FORM)
            setAdding(false)
            onActivityAdded?.()
        } catch {
            setError('Failed to save. Try again.')
        } finally {
            setSaving(false)
        }
    }

    const cancel = () => { setForm(EMPTY_FORM); setAdding(false); setError('') }

    if (loading) return (
        <div className="px-6 py-5 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <Skeleton circle width={32} height={32} />
                    <div className="flex-1">
                        <Skeleton height={13} width={180} borderRadius={6} />
                        <Skeleton height={13} width={220} borderRadius={6} className="mt-1.5" />
                        <Skeleton height={20} width={60} borderRadius={20} className="mt-2" />
                    </div>
                    <Skeleton height={11} width={50} borderRadius={4} />
                </div>
            ))}
        </div>
    )

    return (
        <div className="px-6 py-5">

            {/* ── Header ──────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                        Activity Timeline
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {activities.length}
                    </span>
                </div>
                <button onClick={() => setAdding(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                    style={{ background: T.primary, color: '#fff', boxShadow: `0 2px 8px ${T.primary}40` }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.primaryHover; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}50` }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.boxShadow = `0 2px 8px ${T.primary}40` }}>
                    <IconPlus size={13} />Add Activity
                </button>
            </div>

            {/* ── Inline add form (all inputs/logic unchanged) ─ */}
            {adding && (
                <div className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
                    style={{
                        background: T.primaryFaint,
                        border: `1.5px solid ${T.primary}40`,
                        boxShadow: `0 0 0 3px ${T.primaryDim}`,
                    }}>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold" style={{ color: T.textPrimary }}>New Activity</p>
                        <button onClick={cancel} style={{ color: T.textMuted }}
                            onMouseEnter={e => e.currentTarget.style.color = T.error}
                            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                            <IconX size={15} />
                        </button>
                    </div>

                    {/* Type pills (unchanged) */}
                    <div className="flex gap-2 flex-wrap">
                        {ACTIVITY_TYPES.map(t => {
                            const st = ACTIVITY_STYLES[t]
                            const active = form.type === t
                            return (
                                <button key={t} onClick={() => set('type', t)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all"
                                    style={{
                                        background: active ? st.bg : T.surface,
                                        color: active ? st.color : T.textMuted,
                                        border: active ? `1px solid ${st.color}` : `1px solid ${T.border}`,
                                    }}>
                                    <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                                    {t}
                                </button>
                            )
                        })}
                    </div>

                    {/* Subject (unchanged) */}
                    <input autoFocus type="text" placeholder="Subject *"
                        value={form.subject} onChange={e => set('subject', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submit() }}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                            background: T.surface,
                            border: `1px solid ${error && !form.subject.trim() ? T.error : T.border}`,
                            color: T.textPrimary,
                        }} />

                    {/* Description (unchanged) */}
                    <textarea rows={2} placeholder="Description (optional)"
                        value={form.description} onChange={e => set('description', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrimary }} />

                    {/* Scheduled at (unchanged) */}
                    <div>
                        <label className="text-[11px] font-semibold mb-1 block" style={{ color: T.textMuted }}>
                            Schedule (optional)
                        </label>
                        <input type="datetime-local" value={form.scheduledAt}
                            onChange={e => set('scheduledAt', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrimary }} />
                    </div>

                    {error && <p className="text-[11px] font-semibold" style={{ color: T.error }}>{error}</p>}

                    <div className="flex gap-2 justify-end pt-1">
                        <button onClick={cancel} className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                            style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                            Cancel
                        </button>
                        <button onClick={submit} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold"
                            style={{ background: saving ? T.primaryDim : T.primary, color: saving ? T.primary : '#fff' }}>
                            <IconCheck size={13} />
                            {saving ? 'Saving...' : 'Save Activity'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Timeline list ───────────────────────── */}
            {activities.length === 0 && !adding ? (
                <div className="flex flex-col items-center py-12 gap-3">
                    <div className="w-13 h-13 rounded-2xl flex items-center justify-center"
                        style={{ width: 52, height: 52, background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[22px]"
                            style={{ color: T.primary }}>event_note</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No activities yet</p>
                    <p className="text-xs text-center" style={{ color: T.textMuted }}>
                        Click "Add Activity" to log one against this deal
                    </p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {activities.map((a, i) => {
                        const st = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                        const isLast = i === activities.length - 1
                        return (
                            <div key={a.id} className="flex gap-3 items-start relative">
                                {/* Vertical connector line */}
                                {!isLast && (
                                    <div className="absolute left-4 top-8 bottom-0 w-px"
                                        style={{ background: T.border }} />
                                )}
                                {/* Icon */}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                                    style={{ background: st.bg }}>
                                    <span className="material-symbols-outlined filled text-[14px]"
                                        style={{ color: st.color }}>{st.icon}</span>
                                </div>
                                {/* Content */}
                                <div className="flex-1 pb-5 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                                            {a.subject}
                                        </p>
                                        <span className="text-[11px] shrink-0" style={{ color: T.textMuted }}>
                                            {timeAgo(a.createdAt)}
                                        </span>
                                    </div>
                                    {a.description && (
                                        <p className="text-[12px] mt-0.5" style={{ color: T.textSecondary }}>
                                            {a.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: st.bg, color: st.color }}>{a.type}</span>
                                        {a.owner?.name && (
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                by {a.owner.name}
                                            </span>
                                        )}
                                        {a.contact && (
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                · {a.contact.firstName} {a.contact.lastName}
                                            </span>
                                        )}
                                        {a.scheduledAt && (
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                · {new Date(a.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
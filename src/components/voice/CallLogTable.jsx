import { useState, useRef, useEffect } from 'react'
import { T } from '../../constants/theme'

const fmt = (s) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'Yesterday' : `${d}d ago`
}

const OUTCOME_STYLE = {
    ANSWERED: { bg: 'rgba(22,163,74,0.10)', color: '#16A34A', label: 'Answered' },
    NO_ANSWER: { bg: 'rgba(217,119,6,0.12)', color: '#D97706', label: 'No Answer' },
    BUSY: { bg: 'rgba(120,113,108,0.12)', color: '#78716C', label: 'Busy' },
    FAILED: { bg: 'rgba(220,38,38,0.10)', color: '#DC2626', label: 'Failed' },
}

const STATUS_STYLE = {
    COMPLETED: { bg: 'rgba(22,163,74,0.10)', color: '#16A34A' },
    IN_PROGRESS: { bg: '', color: T.chartBlue },
    INITIATED: { bg: 'rgba(217,119,6,0.12)', color: '#D97706' },
    RINGING: { bg: 'rgba(217,119,6,0.12)', color: '#D97706' },
    FAILED: { bg: 'rgba(220,38,38,0.10)', color: '#DC2626' },
    NO_ANSWER: { bg: 'rgba(217,119,6,0.12)', color: '#D97706' },
    BUSY: { bg: 'rgba(120,113,108,0.12)', color: '#78716C' },
}

// ── Notes popover ─────────────────────────────────────────────
function NotesPopover({ notes, onClose }) {
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [onClose])

    return (
        <div ref={ref}
            className="absolute right-0 top-10 z-50 w-64 rounded-2xl p-4 shadow-xl"
            style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.secondary }}>sticky_note_2</span>
                    <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Call Note</p>
                </div>
                <button onClick={onClose} style={{ color: T.textMuted }}>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
            </div>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: T.textPrimary }}>{notes}</p>
        </div>
    )
}

export default function CallLogTable({ logs = [], loading, compact = false }) {
    const [openNote, setOpenNote] = useState(null) // log.id

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl animate-pulse"
                        style={{ background: T.surfaceRaised }} />
                ))}
            </div>
        )
    }

    if (!logs.length) {
        return (
            <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: T.primaryDim }}>
                    <span className="material-symbols-outlined text-[24px]" style={{ color: T.primary }}>call</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: T.textMuted }}>No call logs yet</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {logs.map(log => {
                const outcome = OUTCOME_STYLE[log.outcome] || null
                const status = STATUS_STYLE[log.status] || STATUS_STYLE.FAILED
                const isOut = log.direction === 'OUTBOUND'
                const noteOpen = openNote === log.id

                return (
                    <div key={log.id}
                        className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                        style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>

                        {/* Direction icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: isOut ? T.primaryDim : T.secondaryDim }}>
                            <span className="material-symbols-outlined text-[18px]"
                                style={{ color: isOut ? T.primary : T.secondary }}>
                                {isOut ? 'call_made' : 'call_received'}
                            </span>
                        </div>

                        {/* Contact */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>
                                {log.contactName || log.toNumber || log.fromNumber}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                                {isOut ? log.toNumber : log.fromNumber}
                                {!compact && log.agentName && ` · ${log.agentName}`}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="text-right shrink-0">
                            <p className="text-sm font-black" style={{ color: T.textPrimary }}>
                                {fmt(log.durationSeconds)}
                            </p>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>{timeAgo(log.createdAt)}</p>
                        </div>

                        {/* Outcome / status badge */}
                        {outcome ? (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                                style={{ background: outcome.bg, color: outcome.color }}>
                                {outcome.label}
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                                style={{ background: status.bg, color: status.color }}>
                                {log.status?.replace('_', ' ')}
                            </span>
                        )}

                        {/* Recording */}
                        {log.recordingUrl && (
                            <a href={log.recordingUrl} target="_blank" rel="noreferrer"
                                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                            </a>
                        )}

                        {/* Notes button — clickable, shows popover */}
                        {log.notes && (
                            <div className="relative shrink-0">
                                <button
                                    onClick={() => setOpenNote(noteOpen ? null : log.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                    style={{
                                        background: noteOpen ? T.secondary : T.secondaryDim,
                                        color: noteOpen ? '#fff' : T.secondary,
                                    }}
                                    title="View note">
                                    <span className="material-symbols-outlined text-[16px]">sticky_note_2</span>
                                </button>
                                {noteOpen && (
                                    <NotesPopover
                                        notes={log.notes}
                                        onClose={() => setOpenNote(null)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
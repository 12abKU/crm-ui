import { T } from '../../constants/theme'
import { PRIORITY_STYLES, STATUS_STYLES, CATEGORY_ICONS, timeAgo } from './supportConstants'

export default function TicketCard({ ticket, isAdmin, onStatusChange, statusUpdating }) {
    const p = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM
    const s = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN
    const catIcon = CATEGORY_ICONS[ticket.category] || 'help'
    const isUpdating = statusUpdating === ticket.id

    return (
        <div className="rounded-2xl overflow-hidden transition-all"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>

            {/* Top accent bar keyed to status */}
            <div className="h-0.5 w-full" style={{ background: s.color + '40' }} />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Category icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>{catIcon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>{ticket.subject}</p>
                                <p className="text-xs mt-0.5 line-clamp-1 leading-relaxed" style={{ color: T.textMuted }}>
                                    {ticket.description}
                                </p>
                            </div>

                            {/* Admin controls */}
                            {isAdmin && onStatusChange && ticket.status !== 'CLOSED' && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {ticket.status === 'OPEN' && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: 'rgba(217,119,6,0.10)', color: '#D97706' }}>
                                            {isUpdating ? '…' : 'In Progress'}
                                        </button>
                                    )}
                                    {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'RESOLVED')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: 'rgba(22,163,74,0.10)', color: '#16A34A' }}>
                                            {isUpdating ? '…' : 'Resolve'}
                                        </button>
                                    )}
                                    {ticket.status === 'RESOLVED' && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'CLOSED')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: 'rgba(100,116,139,0.10)', color: '#64748B' }}>
                                            Close
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: s.bg, color: s.color }}>{s.label}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: p.bg, color: p.color }}>{p.label}</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                #{ticket.id} · {timeAgo(ticket.createdAt)}
                            </span>
                            {isAdmin && ticket.submitterName && (
                                <span className="text-[11px] font-semibold" style={{ color: T.textMuted }}>
                                    by {ticket.submitterName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
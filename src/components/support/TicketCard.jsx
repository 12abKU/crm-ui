import { T } from '../../constants/theme'
import { PRIORITY_STYLES, STATUS_STYLES, CATEGORY_ICONS, timeAgo } from './supportConstants'

export default function TicketCard({ ticket, isAdmin, onStatusChange, statusUpdating }) {
    const p = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM
    const s = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN
    const catIcon = CATEGORY_ICONS[ticket.category] || 'help'
    const isUpdating = statusUpdating === ticket.id

    return (
        <div className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
            }}>

            {/* Status accent bar */}
            <div className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}80)` }} />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Category icon */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: T.primaryFaint, border: `1px solid ${T.primaryDim}` }}>
                        <span className="material-symbols-outlined filled text-[20px]"
                            style={{ color: T.primary }}>{catIcon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                                    {ticket.subject}
                                </p>
                                <p className="text-xs mt-0.5 line-clamp-1 leading-relaxed"
                                    style={{ color: T.textMuted }}>
                                    {ticket.description}
                                </p>
                            </div>

                            {/* Admin action buttons */}
                            {isAdmin && onStatusChange && ticket.status !== 'CLOSED' && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {ticket.status === 'OPEN' && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{
                                                background: 'rgba(217,119,6,0.10)',
                                                color: '#D97706',
                                                border: '1px solid rgba(217,119,6,0.20)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,119,6,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,119,6,0.10)'}>
                                            <span className="material-symbols-outlined text-[12px]">pending</span>
                                            {isUpdating ? '…' : 'In Progress'}
                                        </button>
                                    )}
                                    {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'RESOLVED')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{
                                                background: 'rgba(22,163,74,0.10)',
                                                color: '#16A34A',
                                                border: '1px solid rgba(22,163,74,0.20)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(22,163,74,0.10)'}>
                                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                            {isUpdating ? '…' : 'Resolve'}
                                        </button>
                                    )}
                                    {ticket.status === 'RESOLVED' && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'CLOSED')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{
                                                background: 'rgba(100,116,139,0.10)',
                                                color: '#64748B',
                                                border: '1px solid rgba(100,116,139,0.20)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,116,139,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(100,116,139,0.10)'}>
                                            <span className="material-symbols-outlined text-[12px]">lock</span>
                                            Close
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Meta pills row */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                                style={{ background: s.bg, color: s.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                                {s.label}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: p.bg, color: p.color }}>{p.label}</span>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full"
                                style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                #{ticket.id}
                            </span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                · {timeAgo(ticket.createdAt)}
                            </span>
                            {isAdmin && ticket.submitterName && (
                                <span className="text-[11px] font-semibold ml-auto flex items-center gap-1"
                                    style={{ color: T.textMuted }}>
                                    <span className="material-symbols-outlined text-[12px]">person</span>
                                    {ticket.submitterName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { IconTicket, IconRefresh, IconFilter } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import api from '../../api'
import { PRIORITY_STYLES, STATUS_STYLES, CATEGORY_ICONS, timeAgo } from '../support/supportConstants'
import Skeleton from 'react-loading-skeleton'

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

function PlatformTicketCard({ ticket, onStatusChange, statusUpdating }) {
    const p = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM
    const s = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN
    const catIcon = CATEGORY_ICONS[ticket.category] || 'help'
    const isUpdating = statusUpdating === ticket.id

    return (
        <div className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}80)` }} />
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: T.primaryFaint, border: `1px solid ${T.primaryDim}` }}>
                        <span className="material-symbols-outlined filled text-[18px]"
                            style={{ color: T.primary }}>{catIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                                    {ticket.subject}
                                </p>
                                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: T.textMuted }}>
                                    {ticket.description}
                                </p>
                            </div>

                            {/* Action buttons */}
                            {ticket.status !== 'CLOSED' && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {ticket.status === 'OPEN' && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: 'rgba(217,119,6,0.10)', color: '#D97706', border: '1px solid rgba(217,119,6,0.20)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,119,6,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,119,6,0.10)'}>
                                            <span className="material-symbols-outlined text-[11px]">pending</span>
                                            {isUpdating ? '…' : 'In Progress'}
                                        </button>
                                    )}
                                    {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'RESOLVED')}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: 'rgba(22,163,74,0.10)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.20)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(22,163,74,0.10)'}>
                                            <span className="material-symbols-outlined text-[11px]">check_circle</span>
                                            {isUpdating ? '…' : 'Resolve'}
                                        </button>
                                    )}
                                    {ticket.status === 'RESOLVED' && (
                                        <button disabled={isUpdating}
                                            onClick={() => onStatusChange(ticket.id, 'CLOSED')}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: 'rgba(100,116,139,0.10)', color: '#64748B', border: '1px solid rgba(100,116,139,0.20)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,116,139,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(100,116,139,0.10)'}>
                                            <span className="material-symbols-outlined text-[11px]">lock</span>
                                            Close
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                                style={{ background: s.bg, color: s.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                                {s.label}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: p.bg, color: p.color }}>{p.label}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                #{ticket.id}
                            </span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                · {timeAgo(ticket.createdAt)}
                            </span>
                            {/* Company + submitter */}
                            <span className="ml-auto flex items-center gap-3">
                                {ticket.companyName && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: T.superAdminFaint, color: T.superAdminColor }}>
                                        <span className="material-symbols-outlined text-[11px]">business</span>
                                        {ticket.companyName}
                                    </span>
                                )}
                                {ticket.submitterName && (
                                    <span className="flex items-center gap-1 text-[11px]"
                                        style={{ color: T.textMuted }}>
                                        <span className="material-symbols-outlined text-[11px]">person</span>
                                        {ticket.submitterName}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PlatformTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [statusUpdating, setStatusUpdating] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    const load = async (silent = false) => {
        if (!silent) setLoading(true)
        else setRefreshing(true)
        try {
            const r = await api.get('/api/support/tickets/platform')
            setTickets(r.data)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleStatusChange = async (id, status) => {
        setStatusUpdating(id)
        try {
            const r = await api.patch(`/api/support/tickets/${id}/status`, { status })
            setTickets(prev => prev.map(t => t.id === id ? r.data : t))
        } finally {
            setStatusUpdating(null)
        }
    }

    const filtered = statusFilter === 'ALL'
        ? tickets
        : tickets.filter(t => t.status === statusFilter)

    // Stats
    const counts = tickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
    }, {})

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>
                        Support Tickets
                    </h2>
                    <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                        All tickets across every company
                    </p>
                </div>
                <button onClick={() => load(true)} disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: T.surfaceHigh, color: T.textSecondary }}
                    onMouseEnter={e => e.currentTarget.style.background = T.border}
                    onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}>
                    <IconRefresh size={15} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stat pills */}
            {!loading && (
                <div className="flex items-center gap-3 flex-wrap mb-6">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(k => {
                        const s = STATUS_STYLES[k]
                        const c = counts[k] || 0
                        if (!c) return null
                        return (
                            <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                                style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}20` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                                {c} {s.label}
                            </div>
                        )
                    })}
                    <span className="text-xs ml-1" style={{ color: T.textMuted }}>
                        {tickets.length} total
                    </span>
                </div>
            )}

            {/* Status filter tabs */}
            <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit"
                style={{ background: T.surfaceHigh }}>
                {STATUS_FILTERS.map(f => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                            background: statusFilter === f ? T.surface : 'transparent',
                            color: statusFilter === f ? T.textPrimary : T.textMuted,
                            boxShadow: statusFilter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}>
                        {f === 'ALL' ? 'All' : STATUS_STYLES[f]?.label || f}
                        {f !== 'ALL' && counts[f] ? (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                                style={{ background: STATUS_STYLES[f]?.bg, color: STATUS_STYLES[f]?.color }}>
                                {counts[f]}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Ticket list */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-2xl overflow-hidden"
                            style={{ border: `1px solid ${T.border}`, background: T.surface }}>
                            <div className="h-1" style={{ background: T.borderSubtle }} />
                            <div className="p-5 flex gap-4">
                                <Skeleton circle width={40} height={40} />
                                <div className="flex-1">
                                    <Skeleton height={14} width={240} borderRadius={6} />
                                    <Skeleton height={12} width={340} borderRadius={6} className="mt-2" />
                                    <div className="flex gap-2 mt-3">
                                        <Skeleton height={20} width={60} borderRadius={999} />
                                        <Skeleton height={20} width={55} borderRadius={999} />
                                        <Skeleton height={20} width={100} borderRadius={999} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl p-16 flex flex-col items-center gap-4 text-center"
                    style={{ background: T.surface, border: `1.5px dashed ${T.border}` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: T.surfaceHigh }}>
                        <IconTicket size={24} style={{ color: T.textMuted }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                        {statusFilter === 'ALL' ? 'No tickets yet' : `No ${STATUS_STYLES[statusFilter]?.label} tickets`}
                    </p>
                    <p className="text-xs" style={{ color: T.textMuted }}>
                        Tickets submitted by users across all companies will appear here
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(ticket => (
                        <PlatformTicketCard key={ticket.id} ticket={ticket}
                            onStatusChange={handleStatusChange}
                            statusUpdating={statusUpdating} />
                    ))}
                </div>
            )}
        </div>
    )
}
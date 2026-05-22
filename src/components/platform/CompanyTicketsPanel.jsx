import { useEffect, useState } from 'react'
import { PRIORITY_STYLES, STATUS_STYLES, CATEGORY_ICONS, timeAgo } from '../support/supportConstants'

function CompanyTicketsPanel({ companyId, companyName }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusUpdating, setStatusUpdating] = useState(null)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        api.get(`/api/support/tickets/platform?companyId=${companyId}`)
            .then(r => setTickets((r.data ?? []).filter(t => t.companyId === companyId || !t.companyId)))
            .catch(() => setTickets([]))
            .finally(() => setLoading(false))
    }, [companyId])

    const handleStatusChange = async (id, status) => {
        setStatusUpdating(id)
        try {
            const r = await api.patch(`/api/support/tickets/${id}/status`, { status })
            setTickets(prev => prev.map(t => t.id === id ? r.data : t))
        } finally { setStatusUpdating(null) }
    }

    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: T.surfaceHigh }}>
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{
                                background: filter === f ? T.surface : 'transparent',
                                color: filter === f ? T.textPrimary : T.textMuted,
                            }}>
                            {f === 'ALL' ? 'All' : STATUS_STYLES[f]?.label}
                        </button>
                    ))}
                </div>
                <span className="text-xs ml-2" style={{ color: T.textMuted }}>{tickets.length} total</span>
            </div>

            {loading ? (
                [1, 2].map(i => (
                    <div key={i} className="rounded-xl mb-3 overflow-hidden"
                        style={{ border: `1px solid ${T.border}`, background: T.surface }}>
                        <div className="h-1" style={{ background: T.borderSubtle }} />
                        <div className="p-4"><Skeleton height={14} width={200} borderRadius={6} /><Skeleton height={12} width={280} className="mt-2" borderRadius={6} /></div>
                    </div>
                ))
            ) : filtered.length === 0 ? (
                <div className="rounded-xl p-10 text-center" style={{ background: T.surface, border: `1.5px dashed ${T.border}` }}>
                    <IconTicket size={22} style={{ color: T.textMuted, margin: '0 auto 8px' }} />
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No tickets</p>
                    <p className="text-xs mt-1" style={{ color: T.textMuted }}>No support tickets from {companyName}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(t => {
                        const s = STATUS_STYLES[t.status] || STATUS_STYLES.OPEN
                        const p = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.MEDIUM
                        const isUpdating = statusUpdating === t.id
                        return (
                            <div key={t.id} className="rounded-xl overflow-hidden"
                                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                <div className="h-1" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}60)` }} />
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{t.subject}</p>
                                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: T.textMuted }}>{t.description}</p>
                                        </div>
                                        {t.status !== 'CLOSED' && (
                                            <div className="flex gap-1.5 shrink-0">
                                                {t.status === 'OPEN' && (
                                                    <button disabled={isUpdating} onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                                        style={{ background: 'rgba(217,119,6,0.10)', color: '#D97706' }}>
                                                        {isUpdating ? '…' : 'In Progress'}
                                                    </button>
                                                )}
                                                {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                                                    <button disabled={isUpdating} onClick={() => handleStatusChange(t.id, 'RESOLVED')}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                                        style={{ background: 'rgba(22,163,74,0.10)', color: '#16A34A' }}>
                                                        {isUpdating ? '…' : 'Resolve'}
                                                    </button>
                                                )}
                                                {t.status === 'RESOLVED' && (
                                                    <button disabled={isUpdating} onClick={() => handleStatusChange(t.id, 'CLOSED')}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                                        style={{ background: 'rgba(100,116,139,0.10)', color: '#64748B' }}>
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                                            style={{ background: s.bg, color: s.color }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.label}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: p.bg, color: p.color }}>{p.label}</span>
                                        <span className="text-[11px]" style={{ color: T.textMuted }}>#{t.id} · {timeAgo(t.createdAt)}</span>
                                        {t.submitterName && (
                                            <span className="text-[11px] ml-auto flex items-center gap-1" style={{ color: T.textMuted }}>
                                                <span className="material-symbols-outlined text-[11px]">person</span>{t.submitterName}
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
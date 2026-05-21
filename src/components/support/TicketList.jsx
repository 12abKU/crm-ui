import { T } from '../../constants/theme'
import { IconPlus, IconTicket } from '@tabler/icons-react'
import TicketCard from './TicketCard'
import Skeleton from 'react-loading-skeleton'
import { STATUS_STYLES } from './supportConstants'

function TicketStats({ tickets }) {
    const counts = tickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
    }, {})

    const stats = [
        { key: 'OPEN', label: 'Open' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
        { key: 'RESOLVED', label: 'Resolved' },
        { key: 'CLOSED', label: 'Closed' },
    ]

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {stats.map(({ key, label }) => {
                const s = STATUS_STYLES[key]
                const count = counts[key] || 0
                if (count === 0) return null
                return (
                    <div key={key}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}20` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                        {count} {label}
                    </div>
                )
            })}
        </div>
    )
}

export default function TicketList({ tickets, loading, title, emptyMsg, isAdmin, onStatusChange, statusUpdating, onSubmit }) {
    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div>
                    <h3 className="text-base font-black" style={{ color: T.textPrimary }}>{title}</h3>
                    {!loading && tickets.length > 0 && (
                        <div className="mt-2">
                            <TicketStats tickets={tickets} />
                        </div>
                    )}
                </div>
                <button onClick={onSubmit} className="crm-btn-primary flex items-center gap-2 text-sm shrink-0">
                    <IconPlus size={15} /> New Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl overflow-hidden"
                            style={{
                                border: `1px solid ${T.border}`,
                                background: T.surface,
                            }}>
                            <div className="h-1 w-full" style={{ background: T.borderSubtle }} />
                            <div className="p-5 flex items-start gap-4">
                                <Skeleton circle width={44} height={44} />
                                <div className="flex-1">
                                    <Skeleton height={14} width={220} borderRadius={6} />
                                    <Skeleton height={12} width={320} borderRadius={6} className="mt-2" />
                                    <div className="flex gap-2 mt-3">
                                        <Skeleton height={20} width={60} borderRadius={999} />
                                        <Skeleton height={20} width={55} borderRadius={999} />
                                        <Skeleton height={20} width={80} borderRadius={999} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="rounded-2xl p-16 flex flex-col items-center gap-5 text-center"
                    style={{
                        background: T.surface,
                        border: `1.5px dashed ${T.border}`,
                    }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: T.surfaceHigh }}>
                        <IconTicket size={26} style={{ color: T.textMuted }} />
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No tickets yet</p>
                        <p className="text-xs mt-1 max-w-xs" style={{ color: T.textMuted }}>{emptyMsg}</p>
                    </div>
                    <button onClick={onSubmit} className="crm-btn-primary flex items-center gap-2 text-sm">
                        <IconPlus size={14} /> Submit a Ticket
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} isAdmin={isAdmin}
                            onStatusChange={onStatusChange} statusUpdating={statusUpdating} />
                    ))}
                </div>
            )}
        </div>
    )
}
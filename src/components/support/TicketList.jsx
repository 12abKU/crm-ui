import { T } from '../../constants/theme'
import { IconPlus, IconTicket } from '@tabler/icons-react'
import TicketCard from './TicketCard'
import Skeleton from 'react-loading-skeleton'

export default function TicketList({ tickets, loading, title, emptyMsg, isAdmin, onStatusChange, statusUpdating, onSubmit }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>{title}</h3>
                <button onClick={onSubmit} className="crm-btn-primary flex items-center gap-2 text-sm">
                    <IconPlus size={15} /> New Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                            <div className="h-0.5 w-full" style={{ background: T.border }} />
                            <div className="p-5 flex items-start gap-4">
                                <Skeleton circle width={40} height={40} />
                                <div className="flex-1">
                                    <Skeleton height={14} width={220} borderRadius={6} />
                                    <Skeleton height={12} width={320} borderRadius={6} className="mt-2" />
                                    <div className="flex gap-2 mt-3">
                                        <Skeleton height={18} width={60} borderRadius={999} />
                                        <Skeleton height={18} width={55} borderRadius={999} />
                                        <Skeleton height={18} width={80} borderRadius={999} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="rounded-2xl p-16 flex flex-col items-center gap-4"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: T.surfaceHigh }}>
                        <IconTicket size={24} style={{ color: T.textMuted }} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No tickets yet</p>
                        <p className="text-xs mt-1" style={{ color: T.textMuted }}>{emptyMsg}</p>
                    </div>
                    <button onClick={onSubmit} className="crm-btn-primary text-sm mt-1">Submit a Ticket</button>
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
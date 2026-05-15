import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import { IconUserCheck, IconUserPlus } from '@tabler/icons-react'
import AssignDealModal from './AssignDealModal'

export default function DealCard({
    deal, isDragging, onDragStart, onDragEnd,
    onRemove, highlighted, onClick, assignedToMe, onAssigned
}) {
    const [blink, setBlink] = useState(false)
    const [assignOpen, setAssignOpen] = useState(false)
    const wasDragging = useRef(false)

    const role = useSelector(state => state.auth.role)
    const canAssign = role === 'ADMIN' || role === 'SUPER_ADMIN'

    useEffect(() => {
        if (!highlighted) return
        const timer = setTimeout(() => {
            setBlink(true)
            setTimeout(() => {
                setBlink(false)
                setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 500) }, 500)
            }, 500)
        }, 300)
        return () => clearTimeout(timer)
    }, [highlighted])

    return (
        <>
            <div
                draggable
                onDragStart={() => { wasDragging.current = true; onDragStart() }}
                onDragEnd={() => { onDragEnd(); setTimeout(() => { wasDragging.current = false }, 50) }}
                onClick={() => { if (!wasDragging.current) onClick() }}
                className="rounded-xl p-4 cursor-pointer active:cursor-grabbing group select-none"
                style={{
                    background: blink ? 'rgba(37,99,235,0.28)' : T.surface,
                    border: isDragging
                        ? `1px solid ${T.primary}`
                        : assignedToMe
                            ? `1px solid ${T.secondary}`
                            : `1px solid ${T.border}`,
                    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                    opacity: isDragging ? 0.5 : 1,
                    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                }}>

                {/* Assigned-to-me banner — agents only, only on assigned deals */}
                {assignedToMe && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3 -mx-0.5"
                        style={{ background: T.secondaryFaint, border: `1px solid ${T.secondaryDim}` }}>
                        <span className="material-symbols-outlined text-[13px]" style={{ color: T.secondary }}>assignment_ind</span>
                        <span className="text-[11px] font-bold tracking-wide" style={{ color: T.secondaryText }}>
                            Assigned to you
                        </span>
                        {deal.owner?.name && (
                            <span className="text-[11px] ml-auto" style={{ color: T.textMuted }}>
                                by {deal.owner.name}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-bold leading-snug" style={{ color: T.textPrimary }}>{deal.title}</p>
                    {!assignedToMe && (
                        <button
                            onClick={e => { e.stopPropagation(); onRemove() }}
                            className="material-symbols-outlined text-[15px] opacity-0 group-hover:opacity-100 p-1 rounded shrink-0"
                            style={{ color: T.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                            delete
                        </button>
                    )}
                </div>

                {deal.amount > 0 && (
                    <p className="text-[17px] font-black mt-2" style={{ color: T.primaryText }}>
                        ₹{deal.amount.toLocaleString()}
                    </p>
                )}
                {deal.account && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>business</span>
                        <p className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{deal.account.name}</p>
                    </div>
                )}
                {deal.contact && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>person</span>
                        <p className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{deal.contact.firstName} {deal.contact.lastName}</p>
                    </div>
                )}
                {deal.expectedCloseDate && (
                    <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>schedule</span>
                        <p className="text-[13px] font-medium" style={{ color: T.textSecondary }}>Closes {deal.expectedCloseDate}</p>
                    </div>
                )}

                {/* Assign row — only for ADMIN / SUPER_ADMIN */}
                {canAssign && (
                    <div className="flex items-center justify-between mt-3 pt-3"
                        style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                        <div className="flex items-center gap-1.5">
                            {deal.assignedTo ? (
                                <>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                        style={{ background: T.primaryDim, color: T.primary }}>
                                        {deal.assignedTo.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[12px] font-medium" style={{ color: T.textSecondary }}>
                                        {deal.assignedTo.name}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[12px]" style={{ color: T.textMuted }}>Unassigned</span>
                            )}
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); setAssignOpen(true) }}
                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: deal.assignedTo ? T.primary : T.textMuted }}
                            title={deal.assignedTo ? 'Reassign' : 'Assign to user'}>
                            {deal.assignedTo ? <IconUserCheck size={14} /> : <IconUserPlus size={14} />}
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                    <span className="material-symbols-outlined text-[13px]" style={{ color: T.primary }}>open_in_new</span>
                    <p className="text-[12px] font-medium" style={{ color: T.primary }}>Click to view details</p>
                </div>
            </div>

            {assignOpen && (
                <AssignDealModal
                    deal={deal}
                    onClose={() => setAssignOpen(false)}
                    onAssigned={(updated) => {
                        onAssigned?.(updated)
                        setAssignOpen(false)
                    }}
                />
            )}
        </>
    )
}
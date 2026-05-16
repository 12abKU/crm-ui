import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import { IconUserCheck, IconUserPlus } from '@tabler/icons-react'
import AssignDealModal from './AssignDealModal'

export default function DealCard({
    deal, isDragging, onDragStart, onDragEnd,
    onRemove, highlighted, onClick, onAssigned,
    draggable, canAssign
}) {
    const [blink, setBlink] = useState(false)
    const [assignOpen, setAssignOpen] = useState(false)
    const wasDragging = useRef(false)

    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.userId)

    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const isAgent = role === 'AGENT'

    const assignees = deal.assignees ?? []
    const assigneeNames = assignees.map(u => u.name)

    // Is the current agent assigned to this deal?
    const assignedToMe = isAgent && assignees.some(u => String(u.id) === String(userId))

    // Who assigned this deal? Show owner name for agents
    const assignedByName = deal.owner?.name ?? 'Admin'

    // createdBy — shown only to admin/super_admin
    const createdByName = deal.createdBy?.name ?? deal.owner?.name ?? '—'

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
                draggable={draggable}
                onDragStart={() => { wasDragging.current = true; onDragStart?.() }}
                onDragEnd={() => { onDragEnd?.(); setTimeout(() => { wasDragging.current = false }, 50) }}
                onClick={() => { if (!wasDragging.current) onClick?.() }}
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

                {/* Agent: "Assigned to you by [Admin]" banner */}
                {isAgent && assignedToMe && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3 -mx-0.5"
                        style={{ background: T.secondaryFaint, border: `1px solid ${T.secondaryDim}` }}>
                        <span className="material-symbols-outlined text-[13px]" style={{ color: T.secondary }}>assignment_ind</span>
                        <span className="text-[11px] font-bold tracking-wide" style={{ color: T.secondaryText }}>
                            Assigned to you by {assignedByName}
                        </span>
                    </div>
                )}

                {/* Admin/SuperAdmin: "Created by [Name]" tag */}
                {isAdminOrAbove && (
                    <div className="flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-[12px]" style={{ color: T.textMuted }}>person</span>
                        <span className="text-[11px]" style={{ color: T.textMuted }}>
                            Created by <span className="font-semibold" style={{ color: T.textSecondary }}>{createdByName}</span>
                        </span>
                    </div>
                )}

                {/* Deal title */}
                <p className="text-sm font-bold mb-1 leading-snug" style={{ color: T.textPrimary }}>{deal.title}</p>

                {/* Amount */}
                {deal.amount != null && (
                    <p className="text-base font-extrabold mb-3" style={{ color: T.primary }}>
                        ₹{Number(deal.amount).toLocaleString('en-IN')}
                    </p>
                )}

                {/* Account name */}
                {deal.account?.name && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-[13px]" style={{ color: T.textMuted }}>business</span>
                        <span className="text-[12px] font-medium" style={{ color: T.textSecondary }}>{deal.account.name}</span>
                    </div>
                )}

                {/* Assignees row */}
                {assigneeNames.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="material-symbols-outlined text-[13px]" style={{ color: T.textMuted }}>group</span>
                        <span className="text-[11px]" style={{ color: T.textMuted }}>
                            {assigneeNames.slice(0, 3).join(', ')}
                            {assigneeNames.length > 3 && ` +${assigneeNames.length - 3} more`}
                        </span>
                    </div>
                )}

                {/* Close date */}
                {deal.expectedCloseDate && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-[13px]" style={{ color: T.textMuted }}>event</span>
                        <span className="text-[11px]" style={{ color: T.textMuted }}>
                            {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                )}

                {/* Assign button — admin/super_admin only */}
                {isAdminOrAbove && canAssign && (
                    <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
                        <button
                            onClick={e => { e.stopPropagation(); setAssignOpen(true) }}
                            className="flex items-center gap-1.5 text-[11px] font-bold transition-colors"
                            style={{ color: assigneeNames.length > 0 ? T.secondary : T.textMuted }}
                            onMouseEnter={e => e.currentTarget.style.color = T.primary}
                            onMouseLeave={e => e.currentTarget.style.color = assigneeNames.length > 0 ? T.secondary : T.textMuted}>
                            {assigneeNames.length > 0
                                ? <IconUserCheck size={13} />
                                : <IconUserPlus size={13} />}
                            {assigneeNames.length > 0 ? `${assigneeNames.length} assigned` : 'Assign'}
                        </button>
                    </div>
                )}
            </div>

            {assignOpen && (
                <AssignDealModal
                    deal={deal}
                    onClose={() => setAssignOpen(false)}
                    onAssigned={(updated) => { onAssigned?.(updated); setAssignOpen(false) }}
                />
            )}
        </>
    )
}
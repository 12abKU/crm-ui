import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import { IconUserCheck, IconUserPlus } from '@tabler/icons-react'
import AssignDealModal from './AssignDealModal'

export default function DealCard({
    deal, stage, isDragging, onDragStart, onDragEnd,
    onRemove, highlighted, onClick, onAssigned,
    draggable, canAssign
}) {
    const [blink, setBlink] = useState(false)
    const [assignOpen, setAssignOpen] = useState(false)
    const [hovered, setHovered] = useState(false)
    const wasDragging = useRef(false)

    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.userId)

    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const isAgent = role === 'AGENT'

    const assignees = deal.assignees ?? []
    const assigneeNames = assignees.map(u => u.name)
    const assignedToMe = isAgent && assignees.some(u => String(u.id) === String(userId))
    const assignedByName = deal.owner?.name ?? 'Admin'
    const createdByName = deal.createdBy?.name ?? deal.owner?.name ?? '—'

    const { getStageStyle } = usePipelineStages()
    const stageStyle = getStageStyle(stage)

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

    const daysInStage = deal.stageChangedAt
        ? Math.floor((Date.now() - new Date(deal.stageChangedAt)) / (1000 * 60 * 60 * 24))
        : 0

    const isOverdue = deal.expectedCloseDate && !['WON', 'LOST'].includes(stage)
        && new Date(deal.expectedCloseDate) < new Date()

    return (
        <>
            <div
                draggable={draggable}
                onDragStart={() => { wasDragging.current = true; onDragStart?.() }}
                onDragEnd={() => { onDragEnd?.(); setTimeout(() => { wasDragging.current = false }, 50) }}
                onClick={() => { if (!wasDragging.current) onClick?.() }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="rounded-xl cursor-pointer active:cursor-grabbing select-none overflow-hidden relative"
                style={{
                    background: blink ? '' : T.surface,
                    border: isDragging
                        ? `1.5px solid ${T.primary}`
                        : assignedToMe
                            ? `1.5px solid ${T.secondary}`
                            : hovered
                                ? `1.5px solid ${stageStyle.accent}60`
                                : `1.5px solid ${T.border}`,
                    boxShadow: isDragging
                        ? '0 12px 32px rgba(0,0,0,0.20)'
                        : hovered
                            ? `0 4px 16px rgba(0,0,0,0.10)`
                            : '0 1px 4px rgba(0,0,0,0.06)',
                    opacity: isDragging ? 0.5 : 1,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.3s ease',
                }}>

                <div className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-xl"
                    style={{ background: stageStyle.accent }} />

                <div className="pl-4 pr-3 pt-3 pb-3">

                    {isAgent && assignedToMe && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg mb-2.5"
                            style={{ background: T.secondaryFaint, border: `1px solid ${T.secondaryDim}` }}>
                            <span className="material-symbols-outlined text-[12px]" style={{ color: T.secondary }}>assignment_ind</span>
                            <span className="text-[10px] font-bold tracking-wide" style={{ color: T.secondaryText }}>
                                Assigned by {assignedByName}
                            </span>
                        </div>
                    )}

                    {isAdminOrAbove && (
                        <div className="flex items-center gap-1 mb-2">
                            <span className="material-symbols-outlined text-[11px]" style={{ color: T.textMuted }}>person</span>
                            <span className="text-[10px]" style={{ color: T.textMuted }}>
                                by <span className="font-bold" style={{ color: T.textSecondary }}>{createdByName}</span>
                            </span>
                        </div>
                    )}

                    <p className="text-[13px] font-extrabold leading-snug mb-1.5" style={{ color: T.textPrimary }}>
                        {deal.title}
                    </p>

                    {deal.amount != null && (
                        <p className="text-[15px] font-black mb-2.5" style={{ color: stageStyle.accent }}>
                            ₹{Number(deal.amount).toLocaleString('en-IN')}
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5 mb-1">
                        {daysInStage >= 5 && !['WON', 'LOST'].includes(stage) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg w-fit"
                                style={{ background: T.warningDim, border: `1px solid ${T.warning}50` }}>
                                <span className="material-symbols-outlined text-[12px]" style={{ color: T.warning }}>warning</span>
                                <span className="text-[10px] font-black" style={{ color: T.warning }}>
                                    Stuck: {daysInStage} day{daysInStage !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        {deal.account?.name && (
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[12px]" style={{ color: T.textMuted }}>business</span>
                                <span className="text-[11px] font-semibold truncate" style={{ color: T.textSecondary }}>
                                    {deal.account.name}
                                </span>
                            </div>
                        )}

                        {deal.expectedCloseDate && (
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[12px]"
                                    style={{ color: isOverdue ? T.error : T.textMuted }}>event</span>
                                <span className="text-[11px] font-semibold"
                                    style={{ color: isOverdue ? T.error : T.textMuted }}>
                                    {isOverdue && '⚠ '}
                                    {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        )}

                        {stage === 'LOST' && deal.lostReason && (
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[12px]" style={{ color: T.error }}>flag</span>
                                <span className="text-[11px] font-semibold truncate" style={{ color: T.error }}>
                                    {deal.lostReason}
                                </span>
                            </div>
                        )}

                        {/* Assignees — avatar bubbles + names */}
                        {isAdminOrAbove && assignees.length > 0 && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex -space-x-1.5">
                                    {assignees.slice(0, 3).map((u, i) => (
                                        <div key={u.id}
                                            title={u.name}
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ring-1 ring-white"
                                            style={{
                                                background: T.primaryDim,
                                                color: T.primary,
                                                zIndex: 3 - i,
                                            }}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {assignees.length > 3 && (
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ring-1 ring-white"
                                            style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                            +{assignees.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] font-semibold truncate" style={{ color: T.textSecondary }}>
                                    {assigneeNames.slice(0, 2).join(', ')}{assignees.length > 2 && ` +${assignees.length - 2}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {((isAdminOrAbove && canAssign) || onRemove) && (
                        <div className="flex items-center justify-between pt-2.5 mt-1"
                            style={{ borderTop: `1px solid ${T.border}` }}>
                            {isAdminOrAbove && canAssign ? (
                                <button
                                    onClick={e => { e.stopPropagation(); setAssignOpen(true) }}
                                    className="flex items-center gap-1.5 text-[11px] font-bold transition-colors px-2 py-1 rounded-lg"
                                    style={{ color: assignees.length > 0 ? T.primary : T.textMuted, background: 'transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.color = T.primary }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = assignees.length > 0 ? T.primary : T.textMuted }}>
                                    {assignees.length > 0
                                        ? <IconUserCheck size={12} />
                                        : <IconUserPlus size={12} />}
                                    {assignees.length > 0 ? `${assignees.length} assigned` : 'Assign'}
                                </button>
                            ) : <span />}

                            {onRemove && (
                                <button
                                    onClick={e => { e.stopPropagation(); onRemove() }}
                                    className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    style={{ color: T.textMuted }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.errorDim; e.currentTarget.style.color = T.error; e.currentTarget.style.opacity = 1 }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                    <span className="material-symbols-outlined text-[15px]">delete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
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

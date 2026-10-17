import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import { IconUserCheck, IconUserPlus } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import AssignDealModal from './AssignDealModal'

// ── Helpers ───────────────────────────────────────────────────────
function OwnerAvatar({ user, onClick }) {
    const name = user?.name || '?'
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4','#6366F1']
    const color = colors[name.charCodeAt(0) % colors.length]
    return (
        <div title={`Owner: ${name}`} onClick={onClick} className={onClick ? "cursor-pointer hover:scale-105 active:scale-95 transition-transform" : ""} style={{
            width: 22, height: 22, borderRadius: '50%',
            background: color + '22', border: `1.5px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color, flexShrink: 0
        }}>
            {initials}
        </div>
    )
}

export default function DealCard({
    deal, stage, isDragging, onDragStart, onDragEnd,
    onRemove, onEdit, highlighted, onClick, onAssigned,
    draggable, canAssign
}) {
    const [blink, setBlink] = useState(false)
    const [assignOpen, setAssignOpen] = useState(false)
    const [hovered, setHovered] = useState(false)
    const wasDragging = useRef(false)

    const navigate = useNavigate()
    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.userId)

    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN'
    const isAgent = role === 'AGENT'

    const assignees = deal.assignees ?? []
    const assigneeNames = assignees.map(u => u.name)
    const assignedToMe = isAgent && assignees.some(u => String(u.id) === String(userId))
    const assignedByName = deal.owner?.name ?? 'Admin'
    const createdByName = deal.createdBy?.name ?? deal.owner?.name ?? 'No value'
    const creatorUser = deal.createdBy || deal.owner

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
                className="group rounded-xl cursor-pointer active:cursor-grabbing select-none overflow-hidden relative"
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

                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ background: stageStyle.accent }} />

                <div className="p-3.5 flex flex-col gap-2.5">
                    
                    {/* Header Row: Stuck/Close Date Pill + Owner Avatar */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                        {daysInStage >= 5 && !['WON', 'LOST'].includes(stage) ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide shrink-0"
                                style={{ background: T.warningDim, border: `1px solid ${T.warning}30`, color: T.warning }}>
                                <span className="material-symbols-outlined text-[10px]" style={{ verticalAlign: 'middle' }}>warning</span>
                                {daysInStage}d stuck
                            </div>
                        ) : deal.expectedCloseDate ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                                style={{
                                    background: isOverdue ? T.errorDim : T.surfaceHigh,
                                    border: `1px solid ${isOverdue ? T.error + '40' : T.border}`,
                                    color: isOverdue ? T.error : T.textMuted
                                }}>
                                <span className="material-symbols-outlined text-[10px]" style={{ verticalAlign: 'middle' }}>
                                    {isOverdue ? 'error' : 'event'}
                                </span>
                                {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                        ) : (
                            <div />
                        )}
                        
                        {isAdminOrAbove && creatorUser && (
                            <OwnerAvatar 
                                user={creatorUser} 
                                onClick={e => {
                                    e.stopPropagation()
                                    if (creatorUser?.id) navigate(`/team/${creatorUser.id}`)
                                }}
                            />
                        )}
                    </div>

                    {/* Agent assigned notification */}
                    {isAgent && assignedToMe && (
                        <div className="flex items-center gap-1 px-2 py-0.75 rounded-lg text-[9px] font-bold tracking-wide"
                            style={{ background: T.secondaryFaint, border: `1px solid ${T.secondaryDim}`, color: T.secondaryText }}>
                            <span className="material-symbols-outlined text-[11px]">assignment_ind</span>
                            Assigned by {assignedByName}
                        </div>
                    )}

                    {/* Deal Title and Amount */}
                    <div className="min-w-0">
                        <h4 className="text-[13px] font-bold leading-snug text-left line-clamp-2"
                            style={{ color: T.textPrimary }}
                            title={deal.title}>
                            {deal.title}
                        </h4>
                        {deal.amount != null && (
                            <p className="text-[15px] font-black mt-1 text-left" style={{ color: stageStyle.accent }}>
                                ₹{Number(deal.amount).toLocaleString('en-IN')}
                            </p>
                        )}
                    </div>

                    {/* Metadata lines */}
                    {(deal.account?.name || deal.source || (stage === 'LOST' && deal.lostReason)) && (
                        <div className="flex flex-col gap-1.5 min-w-0">
                            {deal.source && (
                                <div className="flex items-center gap-1.5 w-max px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                                     style={{ 
                                         background: deal.source === 'INDIAMART' ? '#f9731615' : deal.source === 'WHATSAPP' ? '#22c55e15' : deal.source === 'SULEKHA' ? '#3b82f615' : 'rgba(120,113,108,0.1)',
                                         color: deal.source === 'INDIAMART' ? '#ea580c' : deal.source === 'WHATSAPP' ? '#16a34a' : deal.source === 'SULEKHA' ? '#2563eb' : T.textMuted
                                     }}>
                                    <span className="material-symbols-outlined text-[12px] opacity-80 shrink-0">
                                        {deal.source === 'INDIAMART' ? 'storefront' : deal.source === 'WHATSAPP' ? 'chat' : deal.source === 'SULEKHA' ? 'campaign' : 'api'}
                                    </span>
                                    <span>{deal.source}</span>
                                </div>
                            )}

                            {deal.account?.name && (
                                <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: T.textSecondary }}>
                                    <span className="material-symbols-outlined text-[12px] opacity-75 shrink-0">business</span>
                                    <span className="truncate" title={deal.account.name}>
                                        {deal.account.name}
                                    </span>
                                </div>
                            )}

                            {stage === 'LOST' && deal.lostReason && (
                                <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: T.error }}>
                                    <span className="material-symbols-outlined text-[12px] shrink-0">flag</span>
                                    <span className="truncate" title={deal.lostReason}>
                                        {deal.lostReason}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer divider + action bar */}
                    {((isAdminOrAbove && canAssign) || onRemove || onEdit || assignees.length > 0) && (
                        <div className="flex items-center justify-between pt-2 mt-0.5"
                            style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                            
                            {/* Left: Assignees Stack & Assign Button */}
                            <div className="flex items-center gap-1.5 min-w-0">
                                {assignees.length > 0 ? (
                                    <div className="flex -space-x-1.5 shrink-0">
                                        {assignees.slice(0, 3).map((u, i) => (
                                            <div key={u.id}
                                                title={`Assignee: ${u.name}`}
                                                onClick={e => { e.stopPropagation(); navigate(`/team/${u.id}`) }}
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ring-1 ring-white cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                                                style={{
                                                    background: T.primaryDim,
                                                    color: T.primary,
                                                    zIndex: 3 - i,
                                                }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {assignees.length > 3 && (
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ring-1 ring-white"
                                                style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                                +{assignees.length - 3}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                                
                                {isAdminOrAbove && canAssign && (
                                    <button
                                        onClick={e => { e.stopPropagation(); setAssignOpen(true) }}
                                        className="flex items-center justify-center p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors shrink-0"
                                        title="Manage Assignees">
                                        <IconUserPlus size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Right: Action Buttons (group-hover visibility) */}
                            <div className="flex items-center gap-1">
                                {onEdit && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onEdit() }}
                                        className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                        title="Edit Deal">
                                        <span className="material-symbols-outlined text-[15px]">edit</span>
                                    </button>
                                )}
                                {onRemove && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onRemove() }}
                                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                        title="Delete Deal">
                                        <span className="material-symbols-outlined text-[15px]">delete</span>
                                    </button>
                                )}
                            </div>
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

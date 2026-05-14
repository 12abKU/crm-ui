import Skeleton from 'react-loading-skeleton'
import { T, ACTIVITY_STYLES } from '../../constants/theme'
import CompleteToggle from './CompleteToggle'
import OutcomePicker from './OutcomePicker'
import { fmtScheduled, fmtTimelineGroup, getStatus, STATUS_STYLES } from './activityUtils'

export default function TimelineView({ activities, loading, onComplete, onOutcome }) {
    if (loading) return (
        <div className="flex flex-col gap-5 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <Skeleton circle width={32} height={32} />
                    <div className="flex-1">
                        <Skeleton height={13} width={200} borderRadius={6} />
                        <Skeleton height={11} width={140} borderRadius={6} className="mt-1.5" />
                    </div>
                </div>
            ))}
        </div>
    )

    if (activities.length === 0) return (
        <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>event_note</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No activities yet</p>
        </div>
    )

    const groups = []
    let currentLabel = null
    activities.forEach(activity => {
        const label = fmtTimelineGroup(activity.scheduledAt || activity.createdAt)
        if (label !== currentLabel) { groups.push({ label, items: [] }); currentLabel = label }
        groups[groups.length - 1].items.push(activity)
    })

    return (
        <div className="p-6">
            {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px" style={{ background: T.border }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2" style={{ color: T.textMuted }}>
                            {group.label}
                        </span>
                        <div className="flex-1 h-px" style={{ background: T.border }} />
                    </div>
                    <div className="flex flex-col">
                        {group.items.map((activity, idx) => {
                            const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
                            const status = getStatus(activity.scheduledAt, activity.completed)
                            const ss = STATUS_STYLES[status]
                            const isLast = idx === group.items.length - 1
                            return (
                                <div key={activity.id} className="flex gap-3 items-start relative"
                                    style={{ opacity: activity.completed ? 0.6 : 1 }}>
                                    {!isLast && <div className="absolute left-4 top-8 bottom-0 w-px" style={{ background: T.border }} />}
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                                        style={{ background: activity.completed ? T.successDim || 'rgba(22,163,74,0.10)' : s.bg }}>
                                        <span className="material-symbols-outlined text-[14px]"
                                            style={{ color: activity.completed ? T.success : s.color }}>
                                            {activity.completed ? 'task_alt' : s.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 pb-5 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold"
                                                    style={{ color: T.textPrimary, textDecoration: activity.completed ? 'line-through' : 'none' }}>
                                                    {activity.subject || '—'}
                                                </p>
                                                {activity.description && (
                                                    <p className="text-[12px] mt-0.5" style={{ color: T.textSecondary }}>{activity.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    {activity.account && (
                                                        <span className="flex items-center gap-1 text-[11px]" style={{ color: T.textMuted }}>
                                                            <span className="material-symbols-outlined text-[11px]">business</span>
                                                            {activity.account.name}
                                                        </span>
                                                    )}
                                                    {activity.contact && (
                                                        <span className="flex items-center gap-1 text-[11px]" style={{ color: T.textMuted }}>
                                                            <span className="material-symbols-outlined text-[11px]">person</span>
                                                            {activity.contact.firstName} {activity.contact.lastName}
                                                        </span>
                                                    )}
                                                    <OutcomePicker activityId={activity.id} type={activity.type} current={activity.outcome} onSave={onOutcome} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className="text-[11px]" style={{ color: status === 'overdue' ? T.error : T.textMuted }}>
                                                    {fmtScheduled(activity.scheduledAt || activity.createdAt)}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                                                <CompleteToggle activityId={activity.id} completed={activity.completed} onToggle={onComplete} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

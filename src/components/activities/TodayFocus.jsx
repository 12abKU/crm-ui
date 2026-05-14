import Skeleton from 'react-loading-skeleton'
import { T, ACTIVITY_STYLES } from '../../constants/theme'
import { fmtScheduled, getStatus, STATUS_STYLES } from './activityUtils'

function FocusTaskCard({ activity, accent }) {
    const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
    const status = getStatus(activity.scheduledAt, activity.completed)
    const ss = STATUS_STYLES[status]

    return (
        <div className="flex-1 p-4 rounded-xl flex flex-col gap-2 min-w-0"
            style={{
                background: accent === 'red' ? 'rgba(220,38,38,0.06)' : T.primaryDim,
                border: `1px solid ${accent === 'red' ? 'rgba(220,38,38,0.20)' : T.primary + '30'}`,
            }}>
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: s.bg, color: s.color }}>
                    <span className="material-symbols-outlined text-[11px]">{s.icon}</span>
                    {activity.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: ss.bg, color: ss.color }}>
                    {ss.label}
                </span>
            </div>
            <p className="text-sm font-bold leading-tight truncate" style={{ color: T.textPrimary }}>
                {activity.subject}
            </p>
            {activity.account && (
                <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                    <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">business</span>
                    {activity.account.name}
                </p>
            )}
            <p className="text-[11px] font-semibold mt-auto"
                style={{ color: accent === 'red' ? T.error : T.primary }}>
                <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">schedule</span>
                {fmtScheduled(activity.scheduledAt)}
            </p>
        </div>
    )
}

export default function TodayFocus({ overdue, upcoming, loading }) {
    if (loading) return (
        <div className="rounded-2xl p-5 mb-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <Skeleton height={14} width={160} borderRadius={6} className="mb-4" />
            <div className="flex gap-3">
                {[1, 2, 3].map(i => <Skeleton key={i} height={80} borderRadius={12} className="flex-1" />)}
            </div>
        </div>
    )

    if (overdue.length === 0 && upcoming.length === 0) return (
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.10)' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: T.success }}>task_alt</span>
            </div>
            <div>
                <p className="text-sm font-black" style={{ color: T.textPrimary }}>All caught up!</p>
                <p className="text-[12px]" style={{ color: T.textMuted }}>No overdue or upcoming tasks</p>
            </div>
        </div>
    )

    return (
        <div className="rounded-2xl p-5 mb-6 flex flex-col gap-5"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {overdue.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.error }}>error</span>
                        <p className="text-[12px] font-black" style={{ color: T.error }}>Overdue</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(220,38,38,0.10)', color: T.error }}>
                            {overdue.length}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {overdue.map(activity => <FocusTaskCard key={activity.id} activity={activity} accent="red" />)}
                    </div>
                </div>
            )}
            {overdue.length > 0 && upcoming.length > 0 && <div style={{ borderTop: `1px solid ${T.border}` }} />}
            {upcoming.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>bolt</span>
                        <p className="text-[12px] font-black" style={{ color: T.primary }}>Up Next</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {upcoming.length}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {upcoming.map(activity => <FocusTaskCard key={activity.id} activity={activity} accent="blue" />)}
                    </div>
                </div>
            )}
        </div>
    )
}

import Skeleton from 'react-loading-skeleton'
import { T, ACTIVITY_STYLES } from '../../constants/theme'
import { timeAgo } from '../../utils/date'

const TYPE_LABELS = {
    CALL: 'Call',
    EMAIL: 'Email',
    NOTE: 'Note',
    MEETING: 'Meeting',
}

export default function RecentActivityList({ activities, loading }) {
    if (loading) return (
        <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-2xl"
                    style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}>
                    <Skeleton width={40} height={40} borderRadius={12} />
                    <div className="flex-1">
                        <Skeleton height={12} width={200} borderRadius={6} />
                        <Skeleton height={12} width={120} borderRadius={6} className="mt-1.5" />
                    </div>
                    <Skeleton height={24} width={70} borderRadius={20} />
                </div>
            ))}
        </div>
    )

    if (!activities?.length) return (
        <div className="flex flex-col items-center py-14 gap-4">
            <div className="w-14 h-14 flex items-center justify-center"
                style={{
                    borderRadius: 16,
                    background: T.primaryDim,
                    border: `1px solid ${T.primary}20`,
                }}>
                <span className="material-symbols-outlined filled text-[28px]"
                    style={{ color: T.primary }}>event_note</span>
            </div>
            <div className="text-center">
                <p className="text-sm font-black" style={{ color: T.textPrimary }}>No recent activity</p>
                <p className="text-sm mt-1" style={{ color: T.textMuted }}>Log a call, email, or meeting to see it here.</p>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col gap-2">
            {activities.map((activity) => {
                const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
                const meta = [activity.accountName, activity.contactName, activity.dealTitle].filter(Boolean).join(' / ')
                return (
                    <div key={activity.id}
                        className="flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-150"
                        style={{
                            background: T.surfaceRaised,
                            border: `1px solid ${T.borderSubtle}`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = T.primaryFaint
                            e.currentTarget.style.borderColor = `${s.color}35`
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = T.surfaceRaised
                            e.currentTarget.style.borderColor = T.borderSubtle
                        }}
                    >
                        <div className="w-10 h-10 flex items-center justify-center shrink-0"
                            style={{ borderRadius: 13, background: s.bg, border: `1px solid ${s.color}22` }}>
                            <span className="material-symbols-outlined filled text-[16px]"
                                style={{ color: s.color }}>{s.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate" style={{ color: T.textPrimary }}>
                                {activity.subject}
                            </p>
                            {meta && (
                                <p className="text-[12px] mt-0.5 truncate" style={{ color: T.textMuted }}>{meta}</p>
                            )}
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black shrink-0"
                            style={{ background: s.bg, color: s.color }}>
                            {TYPE_LABELS[activity.type] || activity.type}
                        </span>

                        <span className="text-[11px] shrink-0 w-16 text-right"
                            style={{ color: T.textMuted }}>
                            {timeAgo(activity.createdAt)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

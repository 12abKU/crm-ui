import Skeleton from 'react-loading-skeleton'
import { T, ACTIVITY_STYLES, ROW_COLORS } from '../../constants/theme'
import { timeAgo } from '../../utils/date'

export default function RecentActivityList({ activities, loading }) {
    if (loading) return (
        [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 py-4"
                style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                <Skeleton circle width={40} height={40} />
                <div className="flex-1">
                    <Skeleton height={12} width={200} borderRadius={6} />
                    <Skeleton height={12} width={120} borderRadius={6} className="mt-1.5" />
                </div>
                <Skeleton height={24} width={60} borderRadius={20} />
            </div>
        ))
    )

    if (!activities?.length) return (
        <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>event_note</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No recent activity</p>
            <p className="text-sm" style={{ color: T.textMuted }}>Log a call, email, or meeting to see it here.</p>
        </div>
    )

    return activities.map((activity, i) => {
        const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
        const meta = [activity.accountName, activity.contactName, activity.dealTitle].filter(Boolean).join(' · ')
        const rowBg = ROW_COLORS[i % ROW_COLORS.length]
        return (
            <div key={activity.id} className="flex items-start gap-4 py-4 px-3 rounded-xl mb-1" style={{ background: rowBg }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{activity.subject}</p>
                    {meta && <p className="text-[12px] mt-0.5 truncate" style={{ color: T.textMuted }}>{meta}</p>}
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold shrink-0"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                    {timeAgo(activity.createdAt)}
                </span>
            </div>
        )
    })
}

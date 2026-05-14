import { T, ACTIVITY_STYLES } from '../../constants/theme'
import Skeleton from 'react-loading-skeleton'

const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'Yesterday' : `${d}d ago`
}

export default function DealPanelActivities({ activities, loading }) {
    if (loading) return (
        <div className="px-7 py-6 flex flex-col gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <Skeleton circle width={32} height={32} />
                    <div className="flex-1">
                        <Skeleton height={13} width={180} borderRadius={6} />
                        <Skeleton height={13} width={220} borderRadius={6} className="mt-1.5" />
                        <Skeleton height={20} width={60} borderRadius={20} className="mt-2" />
                    </div>
                    <Skeleton height={11} width={50} borderRadius={4} />
                </div>
            ))}
        </div>
    )

    return (
        <div className="px-7 py-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: T.textMuted }}>Activity Timeline</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: T.primaryDim, color: T.primary }}>
                    {activities.length} total
                </span>
            </div>

            {activities.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[22px]" style={{ color: T.primary }}>event_note</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No activities yet</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>Activities linked to this deal appear here</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {activities.map((a, i) => {
                        const st = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                        const isLast = i === activities.length - 1
                        return (
                            <div key={a.id} className="flex gap-3 items-start relative">
                                {!isLast && (
                                    <div className="absolute left-4 top-8 bottom-0 w-px" style={{ background: T.border }} />
                                )}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                                    style={{ background: st.bg }}>
                                    <span className="material-symbols-outlined text-[14px]" style={{ color: st.color }}>{st.icon}</span>
                                </div>
                                <div className="flex-1 pb-5 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                                        <span className="text-[11px] flex-shrink-0" style={{ color: T.textMuted }}>{timeAgo(a.createdAt)}</span>
                                    </div>
                                    {a.description && (
                                        <p className="text-[12px] mt-0.5" style={{ color: T.textSecondary }}>{a.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: st.bg, color: st.color }}>{a.type}</span>
                                        {a.contact && (
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                {a.contact.firstName} {a.contact.lastName}
                                            </span>
                                        )}
                                        {a.scheduledAt && (
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                · {new Date(a.scheduledAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
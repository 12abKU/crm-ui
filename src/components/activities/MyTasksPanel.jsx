import { useCallback, useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { T, ACTIVITY_STYLES } from '../../constants/theme'
import api from '../../api'
import CompleteToggle from './CompleteToggle'
import OutcomePicker from './OutcomePicker'
import { fmtScheduled, getStatus, STATUS_STYLES } from './activityUtils'

export default function MyTasksPanel({ onComplete, onOutcome }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    const loadFirstPage = useCallback(async () => {
        setLoading(true)
        try {
            const r = await api.get('/api/activities/my-tasks?page=0&size=20')
            setTasks(r.data.content ?? [])
            setPage(0)
            const totalP = r.data.totalPages ?? 0
            setTotalPages(totalP)
            setHasMore(0 < totalP - 1)
        } finally { setLoading(false) }
    }, [])

    const loadNextPage = useCallback(async () => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        try {
            const nextPage = page + 1
            const r = await api.get(`/api/activities/my-tasks?page=${nextPage}&size=20`)
            setTasks(prev => [...prev, ...(r.data.content ?? [])])
            setPage(nextPage)
            const totalP = r.data.totalPages ?? 0
            setTotalPages(totalP)
            setHasMore(nextPage < totalP - 1)
        } finally { setLoadingMore(false) }
    }, [page, loadingMore, hasMore])

    useEffect(() => {
        loadFirstPage()
    }, [loadFirstPage])

    const handleComplete = async (id, val) => {
        await onComplete(id, val)
        setTasks(prev => {
            const updated = prev.filter(x => x.id !== id)
            if (updated.length < 5 && hasMore && !loadingMore) {
                // Fetch next chunk immediately to keep checklist populated
                loadNextPage()
            }
            return updated
        })
    }

    if (loading) return (
        <div className="flex flex-col gap-3 p-2">
            {[1, 2, 3].map(i => <Skeleton key={i} height={60} borderRadius={12} />)}
        </div>
    )

    if (tasks.length === 0) return (
        <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: T.successDim || 'rgba(22,163,74,0.10)' }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: T.success }}>task_alt</span>
            </div>
            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>All caught up!</p>
            <p className="text-[12px]" style={{ color: T.textMuted }}>No pending tasks</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-2">
            {tasks.map(activity => {
                const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
                const status = getStatus(activity.scheduledAt, activity.completed)
                const ss = STATUS_STYLES[status]
                return (
                    <div key={activity.id} className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <CompleteToggle activityId={activity.id} completed={activity.completed} onToggle={handleComplete} />
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: s.bg, color: s.color }}>{activity.type}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                                </div>
                                <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{activity.subject}</p>
                                {activity.account && <p className="text-[11px]" style={{ color: T.textMuted }}>{activity.account.name}</p>}
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                                <p className="text-[11px]" style={{ color: status === 'overdue' ? T.error : T.textMuted }}>
                                    {fmtScheduled(activity.scheduledAt)}
                                </p>
                                {activity.reminderAt && (
                                    <p className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: T.warning }}>
                                        <span className="material-symbols-outlined text-[11px]">notifications_active</span>
                                        {fmtScheduled(activity.reminderAt)}
                                    </p>
                                )}
                                <OutcomePicker
                                    activityId={activity.id}
                                    type={activity.type}
                                    current={activity.outcome}
                                    onSave={(id, val) => {
                                        onOutcome(id, val)
                                        setTasks(t => t.map(x => x.id === id ? { ...x, outcome: val } : x))
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
            
            {hasMore && (
                <button
                    onClick={loadNextPage}
                    disabled={loadingMore}
                    className="mt-2 w-full py-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2 hover:brightness-95"
                    style={{
                        background: T.surface,
                        borderColor: T.border,
                        color: T.textPrimary,
                    }}
                >
                    {loadingMore ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                            Loading...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_down</span>
                            Load More Tasks
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

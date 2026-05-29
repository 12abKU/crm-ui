import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import api from '../../api'

export default function DealPanelJourney({ deal }) {
    const { getStageLabel, getStageStyle } = usePipelineStages()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!deal?.id) return
        setLoading(true)
        api.get(`/api/deals/${deal.id}/history`)
            .then(res => setHistory(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [deal?.id])

    const formatDuration = (enteredAt, leftAt) => {
        if (!enteredAt) return 'Unknown'
        const start = new Date(enteredAt).getTime()
        const end = leftAt ? new Date(leftAt).getTime() : Date.now()
        const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor(((end - start) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        if (diffDays > 0) return `${diffDays}d ${diffHours}h`
        if (diffHours > 0) return `${diffHours}h`
        const diffMins = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60))
        return `${diffMins}m`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin w-8 h-8 rounded-full border-4 border-t-transparent"
                    style={{ borderColor: `${T.primary}40`, borderTopColor: T.primary }}></div>
            </div>
        )
    }

    if (!history.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined text-4xl mb-3" style={{ color: T.border }}>route</span>
                <p className="text-sm font-bold" style={{ color: T.textMuted }}>No stage history found.</p>
            </div>
        )
    }

    return (
        <div className="px-6 py-4">
            <h3 className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: T.textMuted }}>
                Stage Journey
            </h3>
            <div className="relative pl-6">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-6 left-[11px] w-0.5 rounded-full" style={{ background: T.border }} />

                {history.map((h, i) => {
                    const style = getStageStyle(h.stage)
                    const label = getStageLabel(h.stage)
                    const isLast = i === history.length - 1

                    return (
                        <div key={h.id} className="relative mb-8 last:mb-2">
                            {/* Node Dot */}
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2"
                                style={{
                                    background: T.surface,
                                    borderColor: style.accent,
                                    boxShadow: `0 0 0 3px ${style.badgeBg}`,
                                    zIndex: 1
                                }} />
                            
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-block mb-1.5"
                                        style={{ background: style.badgeBg, color: style.badgeColor }}>
                                        {label}
                                    </span>
                                    <div className="text-xs font-semibold" style={{ color: T.textSecondary }}>
                                        Entered: <span style={{ color: T.textPrimary }}>{formatDate(h.enteredAt)}</span>
                                    </div>
                                    {h.leftAt && (
                                        <div className="text-xs font-semibold mt-0.5" style={{ color: T.textSecondary }}>
                                            Left: <span style={{ color: T.textPrimary }}>{formatDate(h.leftAt)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="text-left sm:text-right mt-2 sm:mt-0">
                                    <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: T.textMuted }}>
                                        Time in Stage
                                    </div>
                                    <div className="text-sm font-black" style={{ color: isLast ? T.primary : T.textPrimary }}>
                                        {formatDuration(h.enteredAt, h.leftAt)}
                                    </div>
                                    {isLast && !h.leftAt && (
                                        <div className="text-[10px] font-bold mt-1 uppercase" style={{ color: T.primary }}>
                                            Current
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

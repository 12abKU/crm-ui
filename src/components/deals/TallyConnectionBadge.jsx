import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTallyConnectionStatus, setTallyConnection } from '../../store/dealsSlice'
import { T } from '../../constants/theme'

function formatRelativeTime(dateString) {
    if (!dateString) return null
    try {
        const utcStr = (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+'))
            ? dateString + 'Z'
            : dateString
        const d = new Date(utcStr)
        const diffSec = Math.floor((Date.now() - d.getTime()) / 1000)
        if (diffSec < 60) return 'Just now'
        const diffMin = Math.floor(diffSec / 60)
        if (diffMin < 60) return `${diffMin}m ago`
        const diffHr = Math.floor(diffMin / 60)
        if (diffHr < 24) return `${diffHr}h ago`
        return d.toLocaleDateString()
    } catch {
        return null
    }
}

export default function TallyConnectionBadge({ className = '' }) {
    const dispatch = useDispatch()
    const { isConnected, lastHeartbeatAt, lastSyncAt, tallyCompanyName, loading } = useSelector(
        state => state.deals?.tallyConnection || {}
    )

    useEffect(() => {
        dispatch(fetchTallyConnectionStatus(true))

        const handleLiveUpdate = (e) => {
            if (e.detail) {
                dispatch(setTallyConnection({
                    isConnected: Boolean(e.detail.isConnected),
                    lastHeartbeatAt: e.detail.lastHeartbeatAt || new Date().toISOString(),
                    tallyCompanyName: e.detail.tallyCompanyName || '',
                }))
            }
        }

        window.addEventListener('crm-tally-status', handleLiveUpdate)

        // Fast 2-second background heartbeat check
        const intervalId = setInterval(() => {
            dispatch(fetchTallyConnectionStatus(true))
        }, 2000)

        return () => {
            window.removeEventListener('crm-tally-status', handleLiveUpdate)
            clearInterval(intervalId)
        }
    }, [dispatch])

    const handleRefresh = (e) => {
        e.stopPropagation()
        dispatch(fetchTallyConnectionStatus(true))
    }

    const lastSeenText = formatRelativeTime(lastHeartbeatAt)
    const lastSyncText = formatRelativeTime(lastSyncAt)

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition shadow-sm ${className}`}
            style={{
                background: isConnected ? 'rgba(16, 185, 129, 0.1)' : T.surfaceRaised,
                borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : T.border,
                color: isConnected ? '#10b981' : T.textMuted,
            }}
            title={`Tally Company: ${tallyCompanyName || 'Not configured'}\nLast Heartbeat: ${lastSeenText || 'None'}\nLast Stock Sync: ${lastSyncText || 'None'}`}
        >
            <span
                className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                }`}
            />
            <span>{isConnected ? 'Tally Online' : 'Tally Offline'}</span>
            {isConnected && tallyCompanyName && (
                <span className="text-[10px] font-normal opacity-80 max-w-[120px] truncate hidden sm:inline">
                    • {tallyCompanyName}
                </span>
            )}
            {!isConnected && lastSeenText && (
                <span className="text-[10px] font-normal opacity-80 hidden sm:inline">
                    ({lastSeenText})
                </span>
            )}

            <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="ml-1 p-0.5 rounded hover:opacity-80 transition cursor-pointer flex items-center justify-center"
                title="Refresh Tally connection"
            >
                <span
                    className={`material-symbols-outlined text-[13px] ${loading ? 'animate-spin' : ''}`}
                    style={{ color: isConnected ? '#10b981' : T.textMuted }}
                >
                    refresh
                </span>
            </button>
        </div>
    )
}

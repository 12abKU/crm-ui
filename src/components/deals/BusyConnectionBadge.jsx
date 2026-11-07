import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBusyConnectionStatus, setBusyConnection } from '../../store/dealsSlice'
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

export default function BusyConnectionBadge({ className = '' }) {
    const dispatch = useDispatch()
    const { isConfigured, isConnected, lastHeartbeatAt, lastSyncAt, busyCompanyName, loading } = useSelector(
        state => state.deals?.busyConnection || {}
    )

    useEffect(() => {
        dispatch(fetchBusyConnectionStatus(true))

        const handleLiveUpdate = (e) => {
            if (e.detail) {
                const loggedCompanyId = localStorage.getItem('companyId')
                if (loggedCompanyId && e.detail.companyId && String(e.detail.companyId) !== String(loggedCompanyId)) {
                    return // Drop updates intended for a different tenant company
                }
                const configured = Boolean(e.detail.isConfigured ?? (e.detail.busyCompanyName && e.detail.busyCompanyName.trim().length > 0))
                dispatch(setBusyConnection({
                    companyId: loggedCompanyId,
                    isConfigured: configured,
                    isConnected: configured && Boolean(e.detail.isConnected ?? e.detail.connected),
                    lastHeartbeatAt: e.detail.lastHeartbeatAt || new Date().toISOString(),
                    busyCompanyName: configured ? (e.detail.busyCompanyName || '') : '',
                }))
            }
        }

        window.addEventListener('crm-busy-status', handleLiveUpdate)

        // Periodic background heartbeat check
        const intervalId = setInterval(() => {
            dispatch(fetchBusyConnectionStatus(false))
        }, 3000)

        return () => {
            window.removeEventListener('crm-busy-status', handleLiveUpdate)
            clearInterval(intervalId)
        }
    }, [dispatch])

    const handleRefresh = (e) => {
        e.stopPropagation()
        dispatch(fetchBusyConnectionStatus(true))
    }

    const lastSeenText = formatRelativeTime(lastHeartbeatAt)
    const lastSyncText = formatRelativeTime(lastSyncAt)

    if (!isConfigured) {
        return (
            <div
                data-testid="busy-connection-badge"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition shadow-sm ${className}`}
                style={{
                    background: T.surfaceRaised,
                    borderColor: T.border,
                    color: T.textMuted,
                }}
                title="BUSY integration is not configured for your company. Go to Settings > Accounting & ERP to configure."
            >
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
                <span>BUSY Not Configured</span>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="ml-1 p-0.5 rounded hover:opacity-80 transition cursor-pointer flex items-center justify-center"
                    title="Check BUSY configuration"
                >
                    <span className={`material-symbols-outlined text-[13px] ${loading ? 'animate-spin' : ''}`}>
                        refresh
                    </span>
                </button>
            </div>
        )
    }

    return (
        <div
            data-testid="busy-connection-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition shadow-sm ${className}`}
            style={{
                background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.08)',
                borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.25)',
                color: isConnected ? '#10b981' : '#f59e0b',
            }}
            title={`BUSY Company: ${busyCompanyName}\nStatus: ${isConnected ? 'Online' : 'Offline'}\nLast Heartbeat: ${lastSeenText || 'None'}\nLast Stock Sync: ${lastSyncText || 'None'}`}
        >
            <span
                className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
            />
            <span>{isConnected ? 'BUSY Online' : 'BUSY Offline'}</span>
            {busyCompanyName && (
                <span className="text-[10px] font-normal opacity-80 max-w-[120px] truncate hidden sm:inline">
                    • {busyCompanyName}
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
                title="Refresh BUSY connection"
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

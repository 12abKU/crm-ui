import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import busyAPI from '../../api/busy'
import { formatBusyError } from '../../utils/busyGstUtils'
import { setDealSyncStatus } from '../../store/dealsSlice'
import { profileCache, getCachePrefix } from '../../utils/cacheUtils'

/**
 * BusySyncBadge
 * Live status badge indicating BUSY ERP sync status with inline retry controls.
 * Supported statuses:
 * - QUEUED: Order Queued in SQS (automatically polls every 2s to transition live)
 * - SALES_ORDER_CREATED: Sales Order Created in BUSY
 * - DISPATCHED: Goods Dispatched / Sale Challan Created
 * - INVOICED: Sales Tax Invoice Generated
 * - FAILED / SYNC_FAILED: Sync Failed (with inline retry button)
 */
export default function BusySyncBadge({
    status,
    salesOrderNo,
    deliveryNoteNo,
    invoiceNo,
    lastError,
    dealId,
    onRetry,
    compact = false,
}) {
    const dispatch = useDispatch()
    const [retrying, setRetrying] = useState(false)
    const [localError, setLocalError] = useState(null)

    const reduxSync = useSelector(state => dealId ? state.deals?.syncStatuses?.[dealId] : null)

    const effectiveStatus = reduxSync?.busySyncStatus !== undefined ? reduxSync.busySyncStatus : status
    const effectiveInvoiceNo = reduxSync?.busySalesInvoiceNo ?? invoiceNo
    const effectiveDeliveryNoteNo = reduxSync?.busyDeliveryNoteNo ?? deliveryNoteNo
    const effectiveSalesOrderNo = reduxSync?.busySalesOrderNo ?? salesOrderNo
    const effectiveError = reduxSync?.busyLastSyncError ?? lastError

    const normalizedStatus = (effectiveStatus || '').toUpperCase()

    // ── Auto-poll when queued in SQS to catch BUSY bridge ack live ─────
    useEffect(() => {
        if (normalizedStatus !== 'QUEUED' || !dealId) return

        let isMounted = true
        const pollInterval = setInterval(async () => {
            try {
                const res = await busyAPI.getDealSyncStatus(dealId)
                if (!isMounted || !res?.data) return

                const remoteStatus = (res.data.busySyncStatus || res.data.syncStatus || '').toUpperCase()
                if (remoteStatus && remoteStatus !== 'QUEUED') {
                    // Invalidate deal profile cache so DealPanel receives fresh DB data immediately
                    try {
                        profileCache.delete(`${getCachePrefix()}:${dealId}`)
                    } catch (_) {}

                    dispatch(setDealSyncStatus({
                        dealId,
                        busySyncStatus: res.data.busySyncStatus || res.data.syncStatus,
                        busySalesOrderNo: res.data.busySalesOrderNo || res.data.salesOrderNo,
                        busyDeliveryNoteNo: res.data.busyDeliveryNoteNo || res.data.deliveryNoteNo,
                        busySalesInvoiceNo: res.data.busySalesInvoiceNo || res.data.salesInvoiceNo,
                        busyLastSyncError: res.data.lastSyncError,
                    }))
                    if (onRetry) onRetry(dealId)
                }
            } catch (err) {
                // Background poll failure is non-fatal
            }
        }, 2000)

        return () => {
            isMounted = false
            clearInterval(pollInterval)
        }
    }, [normalizedStatus, dealId, dispatch, onRetry])

    const handleRetry = async (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (!dealId || retrying) return

        setRetrying(true)
        setLocalError(null)
        try {
            await busyAPI.retryDealSync(dealId)
            dispatch(setDealSyncStatus({ dealId, busySyncStatus: 'QUEUED', busyLastSyncError: null }))
            if (onRetry) onRetry(dealId)
        } catch (err) {
            console.error('Failed to retry BUSY sync:', err)
            setLocalError(err?.response?.data?.message || err?.message || 'Retry failed')
        } finally {
            setRetrying(false)
        }
    }

    if (!normalizedStatus || normalizedStatus === 'NONE') {
        return null
    }

    // 1. Invoiced terminal state (highest priority when invoice number or INVOICED status present)
    if (effectiveInvoiceNo || normalizedStatus === 'INVOICED') {
        return (
            <div
                data-testid="busy-sync-badge-invoiced"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(22, 163, 74, 0.12)',
                    borderColor: 'rgba(22, 163, 74, 0.35)',
                    color: '#16a34a',
                }}
                title={effectiveInvoiceNo ? `BUSY Sales Invoice: ${effectiveInvoiceNo}` : 'BUSY Sales Tax Invoice Generated'}
            >
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>{effectiveInvoiceNo ? `INV: ${effectiveInvoiceNo}` : 'Invoiced'}</span>
            </div>
        )
    }

    // 2. Queued in SQS (actively polling for bridge fulfillment)
    if (normalizedStatus === 'QUEUED') {
        return (
            <div
                data-testid="busy-sync-badge-queued"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    borderColor: 'rgba(245, 158, 11, 0.35)',
                    color: '#d97706',
                }}
                title="Order Queued in AWS SQS FIFO queue for BUSY sync (syncing live...)"
            >
                <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                <span>Queued in SQS</span>
            </div>
        )
    }

    // 3. Dispatched / Sale Challan
    if (effectiveDeliveryNoteNo || normalizedStatus === 'DISPATCHED') {
        return (
            <div
                data-testid="busy-sync-badge-dispatched"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(147, 51, 234, 0.12)',
                    borderColor: 'rgba(147, 51, 234, 0.35)',
                    color: '#9333ea',
                }}
                title={effectiveDeliveryNoteNo ? `Sale Challan: ${effectiveDeliveryNoteNo}` : 'Goods Dispatched (Sale Challan)'}
            >
                <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                <span>{effectiveDeliveryNoteNo ? `CH: ${effectiveDeliveryNoteNo}` : 'Dispatched'}</span>
            </div>
        )
    }

    // 4. Sales Order Created
    if (effectiveSalesOrderNo || normalizedStatus === 'SALES_ORDER_CREATED') {
        return (
            <div
                data-testid="busy-sync-badge-so"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    borderColor: 'rgba(59, 130, 246, 0.35)',
                    color: '#2563eb',
                }}
                title={effectiveSalesOrderNo ? `Sales Order: ${effectiveSalesOrderNo}` : 'Sales Order Created in BUSY'}
            >
                <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                <span>{effectiveSalesOrderNo ? `SO: ${effectiveSalesOrderNo}` : 'Sales Order Created'}</span>
            </div>
        )
    }

    // 5. Failed state with retry button
    if (normalizedStatus === 'FAILED' || normalizedStatus === 'SYNC_FAILED') {
        const errorText = formatBusyError(localError || effectiveError || 'Sync to BUSY failed')
        return (
            <div
                data-testid="busy-sync-badge-failed"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                    color: '#dc2626',
                }}
                title={errorText}
            >
                <span className="material-symbols-outlined text-[12px]">error</span>
                <span>Sync Failed</span>
                <button
                    type="button"
                    data-testid="busy-retry-btn"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded bg-red-600 text-white text-[9px] hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Retry sending voucher to SQS/BUSY"
                >
                    <span className={`material-symbols-outlined text-[10px] ${retrying ? 'animate-spin' : ''}`}>
                        refresh
                    </span>
                    {retrying ? 'Retrying...' : 'Retry'}
                </button>
            </div>
        )
    }

    return null
}

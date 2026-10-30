import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tallyAPI from '../../api/tally'
import { setDealSyncStatus } from '../../store/dealsSlice'
import { profileCache, getCachePrefix } from '../../utils/cacheUtils'

/**
 * TallySyncBadge
 * Live status badge indicating TallyPrime sync status with inline retry controls.
 * Supported statuses:
 * - QUEUED: Order Queued in SQS (automatically polls every 2s to transition live)
 * - SALES_ORDER_CREATED: Sales Order Created in Tally
 * - DISPATCHED: Goods Dispatched / Delivery Challan Created
 * - INVOICED: Sales Tax Invoice Generated
 * - FAILED: Sync Failed (with inline retry button)
 */
export default function TallySyncBadge({
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

    const effectiveStatus = reduxSync?.tallySyncStatus !== undefined ? reduxSync.tallySyncStatus : status
    const effectiveInvoiceNo = reduxSync?.tallySalesInvoiceNo ?? invoiceNo
    const effectiveDeliveryNoteNo = reduxSync?.tallyDeliveryNoteNo ?? deliveryNoteNo
    const effectiveSalesOrderNo = reduxSync?.tallySalesOrderNo ?? salesOrderNo
    const effectiveError = reduxSync?.tallyLastSyncError ?? lastError

    const normalizedStatus = (effectiveStatus || '').toUpperCase()

    // ── Auto-poll when queued in SQS to catch Tally bridge ack live ─────
    useEffect(() => {
        if (normalizedStatus !== 'QUEUED' || !dealId) return

        let isMounted = true
        const pollInterval = setInterval(async () => {
            try {
                const res = await tallyAPI.getDealSyncStatus(dealId)
                if (!isMounted || !res?.data) return

                const remoteStatus = (res.data.tallySyncStatus || '').toUpperCase()
                if (remoteStatus && remoteStatus !== 'QUEUED') {
                    // Invalidate deal profile cache so DealPanel receives fresh DB data immediately
                    try {
                        profileCache.delete(`${getCachePrefix()}:${dealId}`)
                    } catch (_) {}

                    dispatch(setDealSyncStatus({
                        dealId,
                        tallySyncStatus: res.data.tallySyncStatus,
                        tallySalesOrderNo: res.data.tallySalesOrderNo,
                        tallyDeliveryNoteNo: res.data.tallyDeliveryNoteNo,
                        tallySalesInvoiceNo: res.data.tallySalesInvoiceNo,
                        tallyLastSyncError: res.data.lastSyncError,
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
            await tallyAPI.retryDealSync(dealId)
            dispatch(setDealSyncStatus({ dealId, tallySyncStatus: 'QUEUED', tallyLastSyncError: null }))
            if (onRetry) onRetry(dealId)
        } catch (err) {
            console.error('Failed to retry Tally sync:', err)
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
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(22, 163, 74, 0.12)',
                    borderColor: 'rgba(22, 163, 74, 0.35)',
                    color: '#16a34a',
                }}
                title={effectiveInvoiceNo ? `Sales Invoice: ${effectiveInvoiceNo}` : 'Sales Tax Invoice Generated'}
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
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    borderColor: 'rgba(245, 158, 11, 0.35)',
                    color: '#d97706',
                }}
                title="Order Queued in AWS SQS FIFO queue for Tally sync (syncing live...)"
            >
                <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                <span>Queued in SQS</span>
            </div>
        )
    }

    // 3. Dispatched / Delivery Note
    if (effectiveDeliveryNoteNo || normalizedStatus === 'DISPATCHED') {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(147, 51, 234, 0.12)',
                    borderColor: 'rgba(147, 51, 234, 0.35)',
                    color: '#9333ea',
                }}
                title={effectiveDeliveryNoteNo ? `Delivery Note: ${effectiveDeliveryNoteNo}` : 'Goods Dispatched'}
            >
                <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                <span>{effectiveDeliveryNoteNo ? `DN: ${effectiveDeliveryNoteNo}` : 'Dispatched'}</span>
            </div>
        )
    }

    // 4. Sales Order Created
    if (effectiveSalesOrderNo || normalizedStatus === 'SALES_ORDER_CREATED') {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    borderColor: 'rgba(59, 130, 246, 0.35)',
                    color: '#2563eb',
                }}
                title={effectiveSalesOrderNo ? `Sales Order: ${effectiveSalesOrderNo}` : 'Sales Order Created in Tally'}
            >
                <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                <span>{effectiveSalesOrderNo ? `SO: ${effectiveSalesOrderNo}` : 'Sales Order Created'}</span>
            </div>
        )
    }

    // 5. Failed state with retry button
    if (normalizedStatus === 'FAILED' || normalizedStatus === 'SYNC_FAILED') {
        const errorText = localError || effectiveError || 'Sync to Tally failed'
        return (
            <div
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
                    data-testid="tally-retry-btn"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded bg-red-600 text-white text-[9px] hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Retry sending voucher to SQS/Tally"
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

import React, { useState } from 'react'
import tallyAPI from '../../api/tally'

/**
 * TallySyncBadge
 * Live status badge indicating TallyPrime sync status with inline retry controls.
 * Supported statuses:
 * - QUEUED: Order Queued in SQS
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
    const [retrying, setRetrying] = useState(false)
    const [localError, setLocalError] = useState(null)

    const normalizedStatus = (status || '').toUpperCase()

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

    if (normalizedStatus === 'QUEUED') {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    borderColor: 'rgba(245, 158, 11, 0.35)',
                    color: '#d97706',
                }}
                title="Order Queued in AWS SQS FIFO queue for Tally sync"
            >
                <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                <span>Queued in SQS</span>
            </div>
        )
    }

    if (normalizedStatus === 'SALES_ORDER_CREATED') {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    borderColor: 'rgba(59, 130, 246, 0.35)',
                    color: '#2563eb',
                }}
                title={salesOrderNo ? `Sales Order: ${salesOrderNo}` : 'Sales Order Created in Tally'}
            >
                <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                <span>{salesOrderNo ? `SO: ${salesOrderNo}` : 'Sales Order Created'}</span>
            </div>
        )
    }

    if (normalizedStatus === 'DISPATCHED') {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(147, 51, 234, 0.12)',
                    borderColor: 'rgba(147, 51, 234, 0.35)',
                    color: '#9333ea',
                }}
                title={deliveryNoteNo ? `Delivery Note: ${deliveryNoteNo}` : 'Goods Dispatched'}
            >
                <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                <span>{deliveryNoteNo ? `DN: ${deliveryNoteNo}` : 'Dispatched'}</span>
            </div>
        )
    }

    if (normalizedStatus === 'INVOICED') {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                    background: 'rgba(22, 163, 74, 0.12)',
                    borderColor: 'rgba(22, 163, 74, 0.35)',
                    color: '#16a34a',
                }}
                title={invoiceNo ? `Sales Invoice: ${invoiceNo}` : 'Sales Tax Invoice Generated'}
            >
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>{invoiceNo ? `INV: ${invoiceNo}` : 'Invoiced'}</span>
            </div>
        )
    }

    if (normalizedStatus === 'FAILED' || normalizedStatus === 'SYNC_FAILED') {
        const errorText = localError || lastError || 'Sync to Tally failed'
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

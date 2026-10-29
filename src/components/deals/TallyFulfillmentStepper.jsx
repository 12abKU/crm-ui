import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tallyAPI from '../../api/tally'
import { setDealSyncStatus } from '../../store/dealsSlice'
import { getStepperStepStatus } from '../../utils/tallyGstUtils'
import { T } from '../../constants/theme'

/**
 * TallyFulfillmentStepper
 * 3-Stage Order-to-Cash visual progress stepper:
 * Stage 1: Sales Order (Order reserved in Tally)
 * Stage 2: Delivery Challan (Goods packed & dispatched from Godown)
 * Stage 3: Sales Tax Invoice (Official billing & ledger debit)
 * 
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function TallyFulfillmentStepper({ deal, onStatusUpdated }) {
    const [actionLoading, setActionLoading] = useState(false)
    const [actionError, setActionError] = useState(null)
    const [actionSuccess, setActionSuccess] = useState(null)

    const dispatch = useDispatch()
    const reduxSync = useSelector(state => state.deals?.syncStatuses?.[deal.id])

    if (!deal) return null

    const liveSyncStatus = reduxSync?.tallySyncStatus || deal.tallySyncStatus
    const currentStatus = (liveSyncStatus || (deal.stage === 'WON' ? 'QUEUED' : 'NONE')).toUpperCase()

    const step1Status = getStepperStepStatus(currentStatus, 'SALES_ORDER_CREATED')
    const step2Status = getStepperStepStatus(currentStatus, 'DISPATCHED')
    const step3Status = getStepperStepStatus(currentStatus, 'INVOICED')

    const isFailed = currentStatus === 'FAILED' || currentStatus === 'SYNC_FAILED'

    const handleDispatch = async () => {
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            await tallyAPI.dispatchDeal(deal.id, {})
            dispatch(setDealSyncStatus({ dealId: deal.id, tallySyncStatus: 'DISPATCHED' }))
            setActionSuccess('Goods marked dispatched! Delivery Note enqueued to Tally SQS.')
            if (onStatusUpdated) onStatusUpdated()
        } catch (err) {
            console.error('Dispatch failed:', err)
            setActionError(err?.response?.data?.message || err?.message || 'Failed to dispatch deal')
        } finally {
            setActionLoading(false)
        }
    }

    const handleInvoice = async () => {
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            await tallyAPI.invoiceDeal(deal.id, {})
            dispatch(setDealSyncStatus({ dealId: deal.id, tallySyncStatus: 'INVOICED' }))
            setActionSuccess('Sales Tax Invoice generated and enqueued to Tally SQS!')
            if (onStatusUpdated) onStatusUpdated()
        } catch (err) {
            console.error('Invoicing failed:', err)
            setActionError(err?.response?.data?.message || err?.message || 'Failed to generate invoice')
        } finally {
            setActionLoading(false)
        }
    }

    const handleRetry = async () => {
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            await tallyAPI.retryDealSync(deal.id)
            dispatch(setDealSyncStatus({ dealId: deal.id, tallySyncStatus: 'QUEUED', tallyLastSyncError: null }))
            setActionSuccess('Retry submitted! Voucher re-enqueued to SQS.')
            if (onStatusUpdated) onStatusUpdated()
        } catch (err) {
            console.error('Retry failed:', err)
            setActionError(err?.response?.data?.message || err?.message || 'Failed to retry sync')
        } finally {
            setActionLoading(false)
        }
    }

    const renderStepNode = (stepNumber, title, subtext, status, testId) => {
        const isCompleted = status === 'COMPLETED'
        const isActive = status === 'ACTIVE'
        const isPending = status === 'PENDING'

        let nodeBg = T.surfaceHigh
        let nodeColor = T.textMuted
        let borderColor = T.borderSubtle

        if (isCompleted) {
            nodeBg = 'rgba(16, 185, 129, 0.15)'
            nodeColor = '#10b981'
            borderColor = 'rgba(16, 185, 129, 0.4)'
        } else if (isActive) {
            nodeBg = 'rgba(37, 99, 235, 0.15)'
            nodeColor = '#2563eb'
            borderColor = 'rgba(37, 99, 235, 0.4)'
        }

        return (
            <div data-testid={testId} className="flex-1 flex flex-col items-center text-center relative z-10">
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                        isActive ? 'ring-4 ring-blue-500/20 shadow-md scale-105' : ''
                    }`}
                    style={{ background: nodeBg, color: nodeColor, borderColor: borderColor }}
                >
                    {isCompleted ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                        <span>{stepNumber}</span>
                    )}
                </div>

                <p className="text-xs font-bold mt-2" style={{ color: T.textPrimary }}>{title}</p>
                <p className="text-[10px] mt-0.5 max-w-[120px] truncate" style={{ color: T.textMuted }} title={subtext}>
                    {subtext}
                </p>

                <span
                    className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : isActive
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                            : ''
                    }`}
                    style={isPending ? { background: T.surfaceRaised, color: T.textMuted, borderColor: T.borderSubtle } : {}}
                >
                    {status}
                </span>
            </div>
        )
    }

    return (
        <div
            data-testid="tally-fulfillment-stepper"
            className="p-5 rounded-2xl border shadow-sm flex flex-col gap-4"
            style={{ background: T.surface, borderColor: T.border }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>local_shipping</span>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>TallyPrime Order-to-Cash Fulfillment</h4>
                </div>
                {isFailed && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: T.errorDim, color: T.error }}>
                        Sync Error
                    </span>
                )}
            </div>

            {/* Stepper Nodes */}
            <div className="relative flex items-start justify-between py-2">
                {/* Connecting Line */}
                <div className="absolute top-6 left-12 right-12 h-0.5 z-0" style={{ background: T.border }} />

                {/* Step 1 */}
                {renderStepNode(
                    1,
                    '1. Sales Order',
                    deal.tallySalesOrderNo || 'Stock Reserved',
                    step1Status,
                    'stepper-step-sales-order'
                )}

                {/* Step 2 */}
                {renderStepNode(
                    2,
                    '2. Delivery Note',
                    deal.tallyDeliveryNoteNo || 'Warehouse Dispatch',
                    step2Status,
                    'stepper-step-dispatched'
                )}

                {/* Step 3 */}
                {renderStepNode(
                    3,
                    '3. Sales Invoice',
                    deal.tallySalesInvoiceNo || 'Tax Invoice & Dues',
                    step3Status,
                    'stepper-step-invoiced'
                )}
            </div>

            {/* Error or Success feedback banners */}
            {actionError && (
                <div className="p-3 rounded-lg border text-xs flex items-center justify-between" style={{ background: T.errorDim, borderColor: T.error + '40', color: T.error }}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{actionError}</span>
                    </div>
                    <button
                        type="button"
                        data-testid="tally-retry-btn"
                        onClick={handleRetry}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded text-white font-bold text-[10px] transition cursor-pointer"
                        style={{ background: T.error }}
                    >
                        {actionLoading ? 'Retrying...' : 'Retry'}
                    </button>
                </div>
            )}

            {actionSuccess && (
                <div className="p-3 rounded-lg border text-xs flex items-center gap-2" style={{ background: T.successDim, borderColor: T.success + '40', color: T.success }}>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{actionSuccess}</span>
                </div>
            )}

            {/* Stepper Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                {/* Can dispatch when Sales Order is created and not yet dispatched */}
                {step1Status === 'ACTIVE' && step2Status === 'PENDING' && (
                    <button
                        type="button"
                        data-testid="tally-dispatch-btn"
                        onClick={handleDispatch}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                        style={{ background: '#8b5cf6' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                        {actionLoading ? 'Dispatching...' : 'Dispatch Goods (Delivery Challan)'}
                    </button>
                )}

                {/* Can invoice when goods are dispatched and invoice is pending */}
                {step2Status === 'ACTIVE' && step3Status === 'PENDING' && (
                    <button
                        type="button"
                        data-testid="tally-invoice-btn"
                        onClick={handleInvoice}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                        style={{ background: '#10b981' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        {actionLoading ? 'Invoicing...' : 'Generate Sales Tax Invoice'}
                    </button>
                )}

                {/* Completed state badge */}
                {currentStatus === 'INVOICED' && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 py-1">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Order-to-Cash Complete: Sales Tax Invoice Synced to Tally</span>
                    </div>
                )}

                {/* Retry action if failed */}
                {isFailed && !actionError && (
                    <button
                        type="button"
                        data-testid="tally-retry-btn"
                        onClick={handleRetry}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                        style={{ background: T.error }}
                    >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        {actionLoading ? 'Retrying...' : 'Retry Tally Sync'}
                    </button>
                )}
            </div>
        </div>
    )
}

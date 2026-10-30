import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tallyAPI from '../../api/tally'
import { setDealSyncStatus } from '../../store/dealsSlice'
import { T } from '../../constants/theme'

/**
 * TallyFulfillmentStepper
 * 3-Stage Order-to-Cash visual progress stepper:
 * Stage 1: Sales Order (Order reserved in Tally)
 * Stage 2: Delivery Challan (Goods packed & dispatched from Godown)
 * Stage 3: Sales Tax Invoice (Official billing & ledger debit)
 * 
 * Supports both automatic automation and manual stage-by-stage creation.
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function TallyFulfillmentStepper({ deal, onStatusUpdated }) {
    const [actionLoading, setActionLoading] = useState(false)
    const [actionError, setActionError] = useState(null)
    const [actionSuccess, setActionSuccess] = useState(null)

    const dispatch = useDispatch()
    const reduxSync = useSelector(state => state.deals?.syncStatuses?.[deal?.id])

    if (!deal) return null

    const liveSyncStatus = reduxSync?.tallySyncStatus || deal.tallySyncStatus
    const liveSO = reduxSync?.tallySalesOrderNo ?? deal.tallySalesOrderNo
    const liveDN = reduxSync?.tallyDeliveryNoteNo ?? deal.tallyDeliveryNoteNo
    const liveINV = reduxSync?.tallySalesInvoiceNo ?? deal.tallySalesInvoiceNo
    const currentStatus = (liveSyncStatus || (deal.stage === 'WON' ? 'QUEUED' : 'NONE')).toUpperCase()

    // Real data completion status based on voucher presence and lifecycle states
    const step1Completed = Boolean(liveSO || liveDN || liveINV || ['SALES_ORDER_CREATED', 'DISPATCHED', 'INVOICED'].includes(currentStatus))
    const step2Completed = Boolean(liveDN || liveINV || ['DISPATCHED', 'INVOICED'].includes(currentStatus))
    const step3Completed = Boolean(liveINV || currentStatus === 'INVOICED')

    const isFailed = currentStatus === 'FAILED' || currentStatus === 'SYNC_FAILED'
    const isQueued = currentStatus === 'QUEUED'

    // Auto-poll when fulfillment is actively queued in SQS
    useEffect(() => {
        if (!isQueued || !deal?.id) return
        let mounted = true
        const timer = setInterval(async () => {
            try {
                const res = await tallyAPI.getDealSyncStatus(deal.id)
                if (mounted && res?.data) {
                    const status = (res.data.tallySyncStatus || '').toUpperCase()
                    if (status && status !== 'QUEUED') {
                        dispatch(setDealSyncStatus({
                            dealId: deal.id,
                            tallySyncStatus: res.data.tallySyncStatus,
                            tallySalesOrderNo: res.data.tallySalesOrderNo,
                            tallyDeliveryNoteNo: res.data.tallyDeliveryNoteNo,
                            tallySalesInvoiceNo: res.data.tallySalesInvoiceNo,
                            tallyLastSyncError: res.data.lastSyncError,
                        }))
                        if (onStatusUpdated) onStatusUpdated()
                    }
                }
            } catch (err) {}
        }, 2000)
        return () => {
            mounted = false
            clearInterval(timer)
        }
    }, [isQueued, deal?.id, dispatch, onStatusUpdated])

    // Node statuses
    const step1Status = step1Completed
        ? 'COMPLETED'
        : (isQueued && !step2Completed && !step3Completed ? 'QUEUED' : (isFailed ? 'FAILED' : 'PENDING'))

    const step2Status = step2Completed
        ? 'COMPLETED'
        : (step1Completed && isQueued && !step3Completed ? 'QUEUED' : (step1Completed ? 'READY' : 'PENDING'))

    const step3Status = step3Completed
        ? 'COMPLETED'
        : (step2Completed && isQueued ? 'QUEUED' : (step2Completed ? 'READY' : 'PENDING'))

    // Handlers for manual stage creation
    const handleCreateSalesOrder = async () => {
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            await tallyAPI.createSalesOrder(deal.id)
            dispatch(setDealSyncStatus({ dealId: deal.id, tallySyncStatus: 'QUEUED' }))
            setActionSuccess('Sales Order enqueued to Tally SQS! Tally Desktop Bridge will reserve stock.')
            if (onStatusUpdated) onStatusUpdated()
        } catch (err) {
            console.error('Create Sales Order failed:', err)
            setActionError(err?.response?.data?.message || err?.message || 'Failed to create Sales Order in Tally')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDispatch = async () => {
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            await tallyAPI.dispatchDeal(deal.id, {})
            dispatch(setDealSyncStatus({ dealId: deal.id, tallySyncStatus: 'QUEUED' }))
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
            dispatch(setDealSyncStatus({ dealId: deal.id, tallySyncStatus: 'QUEUED' }))
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
        const isNodeQueued = status === 'QUEUED'
        const isReady = status === 'READY'
        const isNodeFailed = status === 'FAILED'

        let nodeBg = T.surfaceHigh
        let nodeColor = T.textMuted
        let borderColor = T.borderSubtle

        if (isCompleted) {
            nodeBg = 'rgba(16, 185, 129, 0.15)'
            nodeColor = '#10b981'
            borderColor = 'rgba(16, 185, 129, 0.4)'
        } else if (isNodeQueued) {
            nodeBg = 'rgba(245, 158, 11, 0.15)'
            nodeColor = '#f59e0b'
            borderColor = 'rgba(245, 158, 11, 0.4)'
        } else if (isReady) {
            nodeBg = 'rgba(99, 102, 241, 0.15)'
            nodeColor = '#6366f1'
            borderColor = 'rgba(99, 102, 241, 0.4)'
        } else if (isNodeFailed) {
            nodeBg = T.errorDim
            nodeColor = T.error
            borderColor = T.error + '40'
        }

        return (
            <div data-testid={testId} className="flex-1 flex flex-col items-center text-center relative z-10 px-1">
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                        isNodeQueued ? 'ring-4 ring-amber-500/20 shadow-md scale-105' : ''
                    } ${isReady ? 'ring-4 ring-indigo-500/20 shadow-sm scale-105' : ''}`}
                    style={{ background: nodeBg, color: nodeColor, borderColor: borderColor }}
                >
                    {isCompleted ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : isNodeQueued ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    ) : (
                        <span>{stepNumber}</span>
                    )}
                </div>

                <p className="text-xs font-bold mt-2 truncate w-full" style={{ color: T.textPrimary }}>{title}</p>
                <p className="text-[10px] mt-0.5 max-w-[130px] truncate font-mono font-medium" style={{ color: isCompleted ? '#10b981' : T.textMuted }} title={subtext}>
                    {subtext}
                </p>

                <span
                    className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : isNodeQueued
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                            : isReady
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : isNodeFailed
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : ''
                    }`}
                    style={status === 'PENDING' ? { background: T.surfaceRaised, color: T.textMuted, borderColor: T.borderSubtle } : {}}
                >
                    {status === 'QUEUED' ? 'Queued in SQS' : status}
                </span>
            </div>
        )
    }

    // Dynamic progress bar calculation
    let progressWidth = '0%'
    if (step3Completed) {
        progressWidth = '100%'
    } else if (step2Completed) {
        progressWidth = step3Status === 'QUEUED' ? '82%' : '66%'
    } else if (step1Completed) {
        progressWidth = step2Status === 'QUEUED' ? '48%' : '33%'
    } else if (step1Status === 'QUEUED') {
        progressWidth = '15%'
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

            {/* Stepper Nodes & Dynamic Illuminated Progress Bar */}
            <div className="relative flex items-start justify-between py-2">
                {/* Background Track */}
                <div className="absolute top-6 left-12 right-12 h-1 rounded-full z-0 overflow-hidden" style={{ background: T.borderSubtle }}>
                    {/* Glowing Progress Fill */}
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: progressWidth,
                            background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                        }}
                    />
                </div>

                {/* Step 1 */}
                {renderStepNode(
                    1,
                    '1. Sales Order',
                    liveSO || (step1Completed ? 'SO Created' : 'Stock Reserved'),
                    step1Status,
                    'stepper-step-sales-order'
                )}

                {/* Step 2 */}
                {renderStepNode(
                    2,
                    '2. Delivery Note',
                    liveDN || (step2Completed ? 'Challan Dispatched' : 'Warehouse Dispatch'),
                    step2Status,
                    'stepper-step-dispatched'
                )}

                {/* Step 3 */}
                {renderStepNode(
                    3,
                    '3. Sales Invoice',
                    liveINV || (step3Completed ? 'Invoice Synced' : 'Tax Invoice & Dues'),
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

            {/* Stage-by-Stage Manual Actions Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: T.borderSubtle }}>
                {/* Step 1 Action: Create Sales Order manually */}
                {!step1Completed && (
                    <button
                        type="button"
                        data-testid="tally-create-so-btn"
                        onClick={handleCreateSalesOrder}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                        style={{ background: '#2563eb' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        {actionLoading ? 'Creating Sales Order...' : '1. Create Sales Order (Tally)'}
                    </button>
                )}

                {/* Step 2 Action: Dispatch Goods / Delivery Challan */}
                {step1Completed && !step2Completed && (
                    <button
                        type="button"
                        data-testid="tally-dispatch-btn"
                        onClick={handleDispatch}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                        style={{ background: '#8b5cf6' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                        {actionLoading ? 'Dispatching...' : '2. Dispatch Goods (Delivery Note)'}
                    </button>
                )}

                {/* Step 3 Action: Generate Sales Tax Invoice */}
                {step2Completed && !step3Completed && (
                    <button
                        type="button"
                        data-testid="tally-invoice-btn"
                        onClick={handleInvoice}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                        style={{ background: '#10b981' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                        {actionLoading ? 'Invoicing...' : '3. Generate Sales Tax Invoice'}
                    </button>
                )}

                {/* All Steps Completed Notice */}
                {step3Completed && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 py-1">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Order-to-Cash Complete: All Vouchers Synced to Tally</span>
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

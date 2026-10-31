import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tallyAPI from '../../api/tally'
import { setDealSyncStatus } from '../../store/dealsSlice'
import { profileCache, getCachePrefix } from '../../utils/cacheUtils'
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
    const { isConfigured, isConnected, tallyCompanyName } = useSelector(
        state => state.deals?.tallyConnection || {}
    )

    if (!deal) return null

    const liveSyncStatus = reduxSync?.tallySyncStatus || deal.tallySyncStatus
    const liveSO = reduxSync?.tallySalesOrderNo ?? deal.tallySalesOrderNo
    const liveDN = reduxSync?.tallyDeliveryNoteNo ?? deal.tallyDeliveryNoteNo
    const liveINV = reduxSync?.tallySalesInvoiceNo ?? deal.tallySalesInvoiceNo
    const currentStatus = (liveSyncStatus || 'NONE').toUpperCase()

    // Real data completion status based on voucher presence and lifecycle states
    const step1Completed = Boolean(liveSO || liveDN || liveINV || ['SALES_ORDER_CREATED', 'DISPATCHED', 'INVOICED'].includes(currentStatus))
    const step2Completed = Boolean(liveDN || liveINV || ['DISPATCHED', 'INVOICED'].includes(currentStatus))
    const step3Completed = Boolean(liveINV || currentStatus === 'INVOICED')

    const isFailed = isConfigured && (currentStatus === 'FAILED' || currentStatus === 'SYNC_FAILED')
    const isQueued = isConfigured && currentStatus === 'QUEUED'

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
                        try {
                            profileCache.delete(`${getCachePrefix()}:${deal.id}`)
                        } catch (_) {}

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

    // Real-time WebSocket deal-sync event listener
    useEffect(() => {
        const handleDealSync = (e) => {
            const detail = e.detail
            if (detail && detail.dealId === deal?.id) {
                try { profileCache.delete(`${getCachePrefix()}:${deal.id}`) } catch (_) {}
                dispatch(setDealSyncStatus({
                    dealId: deal.id,
                    tallySyncStatus: detail.status,
                    tallySalesOrderNo: detail.voucherType === 'SALES_ORDER' ? detail.voucherNumber : liveSO,
                    tallyDeliveryNoteNo: detail.voucherType === 'DELIVERY_NOTE' ? detail.voucherNumber : liveDN,
                    tallySalesInvoiceNo: detail.voucherType === 'SALES_INVOICE' ? detail.voucherNumber : liveINV,
                    tallyLastSyncError: detail.error || null,
                }))
                if (onStatusUpdated) onStatusUpdated()
            }
        }
        window.addEventListener('crm-tally-deal-sync', handleDealSync)
        return () => window.removeEventListener('crm-tally-deal-sync', handleDealSync)
    }, [deal?.id, liveSO, liveDN, liveINV, dispatch, onStatusUpdated])

    // Node statuses: when Tally is not configured, nodes stay PENDING rather than showing READY
    const step1Status = step1Completed
        ? 'COMPLETED'
        : (isQueued && !step2Completed && !step3Completed ? 'QUEUED' : (isFailed ? 'FAILED' : (isConfigured ? 'READY' : 'PENDING')))

    const step2Status = step2Completed
        ? 'COMPLETED'
        : (step1Completed && isQueued && !step3Completed ? 'QUEUED' : (step1Completed && isConfigured ? 'READY' : 'PENDING'))

    const step3Status = step3Completed
        ? 'COMPLETED'
        : (step2Completed && isQueued ? 'QUEUED' : (step2Completed && isConfigured ? 'READY' : 'PENDING'))

    // Handlers for manual stage creation
    const handleCreateSalesOrder = async () => {
        if (!isConfigured) {
            setActionError('Tally is not configured for your company. Please enter your Tally details in Settings first.')
            return
        }
        if (!isConnected) {
            setActionError('Tally Desktop Bridge is currently offline. Please start TallyPrime and your Tally Bridge agent to sync.')
            return
        }
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            try { profileCache.delete(`${getCachePrefix()}:${deal.id}`) } catch (_) {}
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
        if (!isConfigured) {
            setActionError('Tally is not configured for your company. Please enter your Tally details in Settings first.')
            return
        }
        if (!isConnected) {
            setActionError('Tally Desktop Bridge is currently offline. Please start TallyPrime and your Tally Bridge agent to sync.')
            return
        }
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            try { profileCache.delete(`${getCachePrefix()}:${deal.id}`) } catch (_) {}
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
        if (!isConfigured) {
            setActionError('Tally is not configured for your company. Please enter your Tally details in Settings first.')
            return
        }
        if (!isConnected) {
            setActionError('Tally Desktop Bridge is currently offline. Please start TallyPrime and your Tally Bridge agent to sync.')
            return
        }
        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)
        try {
            try { profileCache.delete(`${getCachePrefix()}:${deal.id}`) } catch (_) {}
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
            try { profileCache.delete(`${getCachePrefix()}:${deal.id}`) } catch (_) {}
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
            {(actionError || (isFailed && (reduxSync?.tallyLastSyncError || deal.tallyLastSyncError))) && (
                <div className="p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 shadow-sm" style={{ background: T.errorDim, borderColor: T.error + '40', color: T.error }}>
                    <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                        <div>
                            <p className="font-bold">TallyPrime Sync Notice</p>
                            <p className="mt-0.5 font-mono text-[11px] leading-relaxed opacity-95">
                                {actionError || reduxSync?.tallyLastSyncError || deal.tallyLastSyncError}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        data-testid="tally-retry-btn"
                        onClick={handleRetry}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-sm"
                        style={{ background: T.error }}
                    >
                        {actionLoading ? 'Retrying...' : 'Retry Sync'}
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
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t" style={{ borderColor: T.borderSubtle }}>
                {!isConfigured ? (
                    <div className="flex flex-wrap items-center justify-between w-full p-3 rounded-xl border text-xs gap-3" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <div className="flex items-center gap-2" style={{ color: T.textSecondary }}>
                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>settings_suggest</span>
                            <span>Tally is not configured for your company. Configure your Tally details in Settings to enable Order-to-Cash sync.</span>
                        </div>
                        <a
                            href="/settings"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs transition cursor-pointer"
                            style={{ background: T.primary }}
                        >
                            <span className="material-symbols-outlined text-[14px]">settings</span>
                            Configure Tally
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 text-xs" style={{ color: isConnected ? '#10b981' : T.textMuted }}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span>{isConnected ? `Connected to ${tallyCompanyName || 'Tally'}` : 'Tally Desktop Bridge Offline'}</span>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            {/* Step 1 Action: Create Sales Order manually */}
                            {!step1Completed && (
                                <button
                                    type="button"
                                    data-testid="tally-create-so-btn"
                                    onClick={handleCreateSalesOrder}
                                    disabled={actionLoading || step1Status === 'QUEUED'}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                    style={{ background: '#2563eb' }}
                                >
                                    <span className={`material-symbols-outlined text-[16px] ${step1Status === 'QUEUED' ? 'animate-spin' : ''}`}>
                                        {step1Status === 'QUEUED' ? 'sync' : 'receipt_long'}
                                    </span>
                                    {step1Status === 'QUEUED' ? 'Sales Order Syncing...' : (actionLoading ? 'Creating Sales Order...' : '1. Create Sales Order (Tally)')}
                                </button>
                            )}

                            {/* Step 2 Action: Dispatch Goods / Delivery Challan */}
                            {step1Completed && !step2Completed && (
                                <button
                                    type="button"
                                    data-testid="tally-dispatch-btn"
                                    onClick={handleDispatch}
                                    disabled={actionLoading || step2Status === 'QUEUED'}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                    style={{ background: '#8b5cf6' }}
                                >
                                    <span className={`material-symbols-outlined text-[16px] ${step2Status === 'QUEUED' ? 'animate-spin' : ''}`}>
                                        {step2Status === 'QUEUED' ? 'sync' : 'local_shipping'}
                                    </span>
                                    {step2Status === 'QUEUED' ? 'Delivery Note Syncing...' : (actionLoading ? 'Dispatching...' : '2. Dispatch Goods (Delivery Note)')}
                                </button>
                            )}

                            {/* Step 3 Action: Generate Sales Tax Invoice */}
                            {step2Completed && !step3Completed && (
                                <button
                                    type="button"
                                    data-testid="tally-invoice-btn"
                                    onClick={handleInvoice}
                                    disabled={actionLoading || step3Status === 'QUEUED'}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                    style={{ background: '#10b981' }}
                                >
                                    <span className={`material-symbols-outlined text-[16px] ${step3Status === 'QUEUED' ? 'animate-spin' : ''}`}>
                                        {step3Status === 'QUEUED' ? 'sync' : 'point_of_sale'}
                                    </span>
                                    {step3Status === 'QUEUED' ? 'Sales Invoice Syncing...' : (actionLoading ? 'Invoicing...' : '3. Generate Sales Tax Invoice')}
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
                    </>
                )}
            </div>
        </div>
    )
}

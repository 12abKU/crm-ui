import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import busyAPI from '../../api/busy'
import { T } from '../../constants/theme'
import TallySettings from './TallySettings'
import BusySettings from './BusySettings'

/**
 * ErpSettings
 * Multi-ERP container with 3-way radio selector (None, TallyPrime, BUSY ERP).
 * Persists active ERP selection to `POST /api/companies/{companyId}/erp`.
 * Conditionally renders TallySettings or BusySettings based on active selection.
 */
export default function ErpSettings() {
    const companyId = useSelector(state => state.auth?.companyId || localStorage.getItem('companyId') || '')
    const [activeErp, setActiveErp] = useState('NONE') // 'NONE' | 'TALLY_PRIME' | 'BUSY_ERP'
    const [loading, setLoading] = useState(true)
    const [switching, setSwitching] = useState(false)
    const [feedback, setFeedback] = useState(null)

    useEffect(() => {
        let isMounted = true
        const fetchErp = async () => {
            if (!companyId) {
                setLoading(false)
                return
            }
            try {
                const res = await busyAPI.getActiveErp(companyId)
                if (isMounted && res?.data?.activeErp) {
                    setActiveErp(res.data.activeErp.toUpperCase())
                }
            } catch (err) {
                // Non-fatal fallback; check if Tally is configured as default
                console.warn('Could not fetch active ERP provider, checking defaults:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchErp()

        return () => {
            isMounted = false
        }
    }, [companyId])

    const handleSwitchErp = async (newErp) => {
        if (newErp === activeErp || switching) return
        setSwitching(true)
        setFeedback(null)
        try {
            await busyAPI.setActiveErp(companyId, newErp)
            setActiveErp(newErp)
            setFeedback({
                type: 'success',
                message: `Active ERP system updated to ${newErp === 'BUSY_ERP' ? 'BUSY ERP' : (newErp === 'TALLY_PRIME' ? 'TallyPrime' : 'None')}.`,
            })
            try {
                window.dispatchEvent(new CustomEvent('crm-erp-changed', { detail: { companyId, activeErp: newErp } }))
            } catch (_) {}
        } catch (err) {
            console.error('Failed to update active ERP provider:', err)
            setFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || 'Failed to switch ERP provider.',
            })
        } finally {
            setSwitching(false)
        }
    }

    if (loading) {
        return (
            <div className="p-12 text-center text-sm" style={{ color: T.textMuted }}>
                <span className="material-symbols-outlined text-[28px] animate-spin block mb-2" style={{ color: T.primary }}>
                    sync
                </span>
                Loading company ERP integration settings...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Top Multi-ERP Switcher Card */}
            <div className="p-6 rounded-2xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[22px]" style={{ color: T.primary }}>account_balance</span>
                        <div>
                            <h3 className="text-base font-black" style={{ color: T.textPrimary }}>
                                Accounting & ERP System Provider
                            </h3>
                            <p className="text-xs" style={{ color: T.textMuted }}>
                                Select your company's active accounting and factory inventory provider.
                            </p>
                        </div>
                    </div>
                    {switching && (
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 animate-pulse">
                            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                            Saving ERP selection...
                        </span>
                    )}
                </div>

                {/* 3-Way Radio Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. None */}
                    <button
                        type="button"
                        data-testid="erp-switcher-none"
                        onClick={() => handleSwitchErp('NONE')}
                        disabled={switching}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                            activeErp === 'NONE' ? 'ring-2 ring-indigo-500 shadow-sm' : 'hover:opacity-90'
                        }`}
                        style={{
                            background: activeErp === 'NONE' ? T.surfaceHigh : T.surfaceRaised,
                            borderColor: activeErp === 'NONE' ? T.primary : T.borderSubtle,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black" style={{ color: activeErp === 'NONE' ? T.primary : T.textPrimary }}>
                                None (Standalone CRM)
                            </span>
                            <span
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                    activeErp === 'NONE' ? 'border-indigo-500' : 'border-neutral-500'
                                }`}
                            >
                                {activeErp === 'NONE' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: T.textMuted }}>
                            Standard CRM quotations without automated external ERP voucher syncing.
                        </p>
                    </button>

                    {/* 2. TallyPrime */}
                    <button
                        type="button"
                        data-testid="erp-switcher-tally"
                        onClick={() => handleSwitchErp('TALLY_PRIME')}
                        disabled={switching}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                            activeErp === 'TALLY_PRIME' ? 'ring-2 ring-indigo-500 shadow-sm' : 'hover:opacity-90'
                        }`}
                        style={{
                            background: activeErp === 'TALLY_PRIME' ? T.surfaceHigh : T.surfaceRaised,
                            borderColor: activeErp === 'TALLY_PRIME' ? T.primary : T.borderSubtle,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black flex items-center gap-1" style={{ color: activeErp === 'TALLY_PRIME' ? T.primary : T.textPrimary }}>
                                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                TallyPrime
                            </span>
                            <span
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                    activeErp === 'TALLY_PRIME' ? 'border-indigo-500' : 'border-neutral-500'
                                }`}
                            >
                                {activeErp === 'TALLY_PRIME' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: T.textMuted }}>
                            TallyPrime on Port 9000, godown inventory, ledger maps, and SQS FIFO order-to-cash.
                        </p>
                    </button>

                    {/* 3. BUSY ERP */}
                    <button
                        type="button"
                        data-testid="erp-switcher-busy"
                        onClick={() => handleSwitchErp('BUSY_ERP')}
                        disabled={switching}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                            activeErp === 'BUSY_ERP' ? 'ring-2 ring-indigo-500 shadow-sm' : 'hover:opacity-90'
                        }`}
                        style={{
                            background: activeErp === 'BUSY_ERP' ? T.surfaceHigh : T.surfaceRaised,
                            borderColor: activeErp === 'BUSY_ERP' ? T.primary : T.borderSubtle,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black flex items-center gap-1" style={{ color: activeErp === 'BUSY_ERP' ? T.primary : T.textPrimary }}>
                                <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                                BUSY ERP
                            </span>
                            <span
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                    activeErp === 'BUSY_ERP' ? 'border-indigo-500' : 'border-neutral-500'
                                }`}
                            >
                                {activeErp === 'BUSY_ERP' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: T.textMuted }}>
                            BUSY 21 on Port 981, material centers (default Main Store), and SQS FIFO fulfillment.
                        </p>
                    </button>
                </div>
            </div>

            {/* Feedback message */}
            {feedback && (
                <div
                    className="p-4 rounded-xl text-xs flex items-center gap-2 border"
                    style={{
                        background: feedback.type === 'success' ? T.successDim : T.errorDim,
                        borderColor: (feedback.type === 'success' ? T.success : T.error) + '40',
                        color: feedback.type === 'success' ? T.success : T.error,
                    }}
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {feedback.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Sub-panel rendering based on selected ERP */}
            {activeErp === 'NONE' && (
                <div className="p-12 text-center rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3" style={{ background: T.surface, borderColor: T.borderSubtle }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: T.primaryDim, color: T.primary }}>
                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>No Accounting ERP Connected</h4>
                    <p className="text-xs max-w-md leading-relaxed" style={{ color: T.textMuted }}>
                        You are currently in standalone CRM mode. To enable automatic live stock checking, material center reservation, and voucher synchronization, select <strong>TallyPrime</strong> or <strong>BUSY ERP</strong> above.
                    </p>
                </div>
            )}

            {activeErp === 'TALLY_PRIME' && <TallySettings />}
            {activeErp === 'BUSY_ERP' && <BusySettings />}
        </div>
    )
}

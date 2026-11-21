import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import busyAPI from '../../api/busy'
import { T } from '../../constants/theme'
import TallySettings from './TallySettings'
import BusySettings from './BusySettings'

/**
 * ErpSettings
 * Ultra-premium Multi-ERP container with 3-way interactive provider cards
 * (None, TallyPrime, BUSY ERP).
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
                message: `Active ERP system updated to ${newErp === 'BUSY_ERP' ? 'BUSY ERP' : (newErp === 'TALLY_PRIME' ? 'TallyPrime' : 'None (Standalone)')}.`,
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
            <div
                className="p-16 text-center text-sm rounded-2xl border flex flex-col items-center justify-center gap-3"
                style={{ background: T.surface, borderColor: T.border }}
            >
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center animate-spin"
                    style={{ background: T.primaryDim, color: T.primary }}
                >
                    <span className="material-symbols-outlined text-[24px]">sync</span>
                </div>
                <span className="font-semibold text-sm" style={{ color: T.textMuted }}>
                    Loading company ERP integration settings...
                </span>
            </div>
        )
    }

    const PROVIDERS = [
        {
            id: 'NONE',
            name: 'Standalone CRM',
            badge: 'Native',
            icon: 'inventory_2',
            iconColor: '#94A3B8',
            desc: 'Standard CRM quotations without external accounting voucher automation.',
            tags: ['Quotations Only', 'Manual Invoicing'],
            testId: 'erp-switcher-none',
        },
        {
            id: 'TALLY_PRIME',
            name: 'TallyPrime',
            badge: 'Port 9000',
            icon: 'receipt_long',
            iconColor: '#38BDF8',
            desc: 'Automate sales orders, godown stock verification, and XML ledger sync.',
            tags: ['Port 9000 XML', 'Godown Stock', 'SQS FIFO'],
            testId: 'erp-switcher-tally',
        },
        {
            id: 'BUSY_ERP',
            name: 'BUSY ERP 21',
            badge: 'Port 981 Gateway',
            icon: 'point_of_sale',
            iconColor: '#F59E0B',
            desc: 'Automated order-to-cash, material centers (Main Store), and GST vouchers.',
            tags: ['Port 981 JSON', 'Material Centers', 'FIFO Fulfillment'],
            testId: 'erp-switcher-busy',
        },
    ]

    return (
        <div className="flex flex-col gap-7 w-full">
            {/* Top Multi-ERP Switcher Card */}
            <div
                className="p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-all duration-300"
                style={{
                    background: T.surface,
                    borderColor: T.border,
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                }}
            >
                {/* Subtle top edge glow */}
                <div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{
                        background: `linear-gradient(90deg, transparent 0%, ${T.primary}50 50%, transparent 100%)`,
                    }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-3.5">
                        <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: T.primaryDim,
                                border: `1px solid ${T.primary}30`,
                                boxShadow: `0 4px 12px ${T.primary}20`,
                            }}
                        >
                            <span className="material-symbols-outlined filled text-[22px]" style={{ color: T.primary }}>
                                account_balance
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-black tracking-tight" style={{ color: T.textPrimary }}>
                                    Accounting &amp; ERP System Provider
                                </h3>
                                <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                    style={{
                                        background: T.primaryDim,
                                        color: T.primary,
                                        border: `1px solid ${T.primary}20`,
                                    }}
                                >
                                    Routing Engine
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm mt-0.5" style={{ color: T.textMuted }}>
                                Select your company's active accounting and factory inventory provider.
                            </p>
                        </div>
                    </div>

                    {switching && (
                        <div
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 animate-pulse"
                            style={{
                                background: T.primaryDim,
                                border: `1px solid ${T.primary}40`,
                                color: T.primary,
                            }}
                        >
                            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                            <span>Updating Provider...</span>
                        </div>
                    )}
                </div>

                {/* 3-Way Interactive Provider Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                    {PROVIDERS.map((prov) => {
                        const isSelected = activeErp === prov.id
                        return (
                            <button
                                key={prov.id}
                                type="button"
                                data-testid={prov.testId}
                                onClick={() => handleSwitchErp(prov.id)}
                                disabled={switching}
                                className={`group p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${
                                    isSelected
                                        ? 'scale-[1.01] shadow-lg'
                                        : 'hover:scale-[1.005] hover:opacity-95'
                                }`}
                                style={{
                                    background: isSelected
                                        ? (T.isDark ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(30, 41, 59, 0.6) 100%)' : 'linear-gradient(145deg, rgba(99, 102, 241, 0.04) 0%, #FFFFFF 100%)')
                                        : T.surfaceRaised,
                                    borderColor: isSelected ? T.primary : T.borderSubtle,
                                    boxShadow: isSelected
                                        ? `0 12px 24px -6px ${T.primary}25, 0 0 0 1.5px ${T.primary}`
                                        : '0 2px 8px rgba(0, 0, 0, 0.03)',
                                }}
                            >
                                {/* Top bar highlight on active */}
                                {isSelected && (
                                    <div
                                        className="absolute inset-x-0 top-0 h-[3px]"
                                        style={{ background: T.primary }}
                                    />
                                )}

                                <div>
                                    {/* Provider Header: Icon, Badge, Radio */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                                                style={{
                                                    background: isSelected ? `${prov.iconColor}22` : T.surfaceHigh,
                                                    border: `1px solid ${isSelected ? prov.iconColor + '40' : T.borderSubtle}`,
                                                }}
                                            >
                                                <span
                                                    className="material-symbols-outlined text-[20px]"
                                                    style={{ color: isSelected ? prov.iconColor : T.textSecondary }}
                                                >
                                                    {prov.icon}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="text-xs sm:text-sm font-black truncate"
                                                        style={{ color: isSelected ? T.textPrimary : T.textSecondary }}
                                                    >
                                                        {prov.name}
                                                    </span>
                                                </div>
                                                <span
                                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block mt-0.5"
                                                    style={{
                                                        background: isSelected ? `${prov.iconColor}15` : T.surfaceHigh,
                                                        color: isSelected ? prov.iconColor : T.textMuted,
                                                        border: `1px solid ${isSelected ? prov.iconColor + '30' : 'transparent'}`,
                                                    }}
                                                >
                                                    {prov.badge}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Styled Radio Pill */}
                                        <div
                                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                                            style={{
                                                borderColor: isSelected ? T.primary : T.border,
                                                background: isSelected ? T.primaryDim : 'transparent',
                                            }}
                                        >
                                            {isSelected && (
                                                <div
                                                    className="w-2 h-2 rounded-full transition-transform duration-150 scale-100"
                                                    style={{ background: T.primary }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p
                                        className="text-[11.5px] leading-relaxed line-clamp-2 mt-1"
                                        style={{ color: isSelected ? T.textSecondary : T.textMuted }}
                                    >
                                        {prov.desc}
                                    </p>
                                </div>

                                {/* Capability Tags */}
                                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                                    {prov.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="text-[9.5px] font-bold px-2 py-0.5 rounded-md"
                                            style={{
                                                background: isSelected ? `${T.primary}12` : T.surfaceHigh,
                                                color: isSelected ? T.primary : T.textMuted,
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {isSelected && (
                                        <span
                                            className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-wider"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Feedback alert toast */}
            {feedback && (
                <div
                    className="p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 border shadow-sm transition-all duration-200"
                    style={{
                        background: feedback.type === 'success' ? T.successDim : T.errorDim,
                        borderColor: (feedback.type === 'success' ? T.success : T.error) + '40',
                        color: feedback.type === 'success' ? T.success : T.error,
                    }}
                >
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                        {feedback.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="leading-snug">{feedback.message}</span>
                </div>
            )}

            {/* Sub-panel rendering based on selected ERP */}
            {activeErp === 'NONE' && (
                <div
                    className="p-12 sm:p-16 text-center rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all"
                    style={{ background: T.surface, borderColor: T.borderSubtle }}
                >
                    <div
                        className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner"
                        style={{ background: T.primaryDim, color: T.primary }}
                    >
                        <span className="material-symbols-outlined text-[32px]">account_balance_wallet</span>
                    </div>
                    <div className="max-w-md text-center">
                        <h4 className="text-base sm:text-lg font-black tracking-tight" style={{ color: T.textPrimary }}>
                            No Accounting ERP Connected
                        </h4>
                        <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: T.textMuted }}>
                            You are currently in standalone CRM mode. Select <strong>TallyPrime</strong> or <strong>BUSY ERP 21</strong> above to enable automatic live stock checking, material center reservation, and voucher synchronization.
                        </p>
                    </div>
                </div>
            )}

            {activeErp === 'TALLY_PRIME' && <TallySettings />}
            {activeErp === 'BUSY_ERP' && <BusySettings />}
        </div>
    )
}

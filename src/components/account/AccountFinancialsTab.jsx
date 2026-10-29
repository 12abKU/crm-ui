import React, { useEffect, useState } from 'react'
import tallyAPI from '../../api/tally'
import {
    calculateCreditMetrics,
    evaluateAgingRisk,
} from '../../utils/tallyGstUtils'
import { T } from '../../constants/theme'

/**
 * AccountFinancialsTab
 * 360-degree Financial Overview synced from TallyPrime:
 * - Credit Limit, Closing Balance, Available Credit
 * - Visual Utilization Bar & Credit Exceeded Alert
 * - 5-Tier Overdue Aging Breakdown (0-30, 31-60, 61-90, 91-120, >120 days)
 * - Aging Risk Badge (LOW, MEDIUM, HIGH, CRITICAL)
 * - Tally Ledger Metadata & GST Registration
 * 
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function AccountFinancialsTab({ accountId, account }) {
    const [financials, setFinancials] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        let isMounted = true

        const fetchFinancials = async () => {
            if (!accountId) return
            setLoading(true)
            setErrorMsg(null)

            try {
                const res = await tallyAPI.getAccountFinancials(accountId)
                if (!isMounted) return
                const data = res?.data || res || {}
                setFinancials(data)
            } catch (err) {
                console.error('Failed to load account financials:', err)
                if (!isMounted) return
                if (err?.response?.status === 404) {
                    setErrorMsg('No TallyPrime ledger linked to this account yet.')
                } else if (err?.response?.status === 403) {
                    setErrorMsg('Access denied: You do not have permission to view financials for this company.')
                } else {
                    setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to fetch financial data.')
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchFinancials()

        return () => {
            isMounted = false
        }
    }, [accountId])

    // Derive metrics using our pure calculation utility
    const creditLimit = Number(financials?.creditLimit ?? account?.creditLimit ?? 0)
    const closingBalance = Number(financials?.closingBalance ?? financials?.outstandingBalance ?? account?.closingBalance ?? 0)
    const aging = financials?.aging || {
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        days90Plus: 0,
    }

    const metrics = calculateCreditMetrics(creditLimit, closingBalance)
    const riskLevel = evaluateAgingRisk(aging)

    const getRiskBadgeStyle = (risk) => {
        switch (risk) {
            case 'CRITICAL':
                return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' }
            case 'HIGH':
                return { bg: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', border: 'rgba(234, 88, 12, 0.4)' }
            case 'MEDIUM':
                return { bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: 'rgba(245, 158, 11, 0.4)' }
            case 'LOW':
            default:
                return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.4)' }
        }
    }

    const riskStyle = getRiskBadgeStyle(riskLevel)

    // Utilization bar color
    let barColor = '#10b981'
    if (metrics.utilizationPercent > 80 || metrics.isExceeded) {
        barColor = '#ef4444'
    } else if (metrics.utilizationPercent > 50) {
        barColor = '#f59e0b'
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-xs" style={{ color: T.textMuted }}>
                <span className="material-symbols-outlined text-[24px] animate-spin block mb-2" style={{ color: T.primary }}>
                    sync
                </span>
                Loading TallyPrime credit and aging financials...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Limit Exceeded Alert */}
            {metrics.isExceeded && (
                <div
                    data-testid="account-credit-exceeded-alert"
                    className="p-4 rounded-xl border flex items-center gap-3"
                    style={{ background: T.errorDim, borderColor: T.error + '40', color: T.error }}
                >
                    <span className="material-symbols-outlined text-[24px] shrink-0" style={{ color: T.error }}>
                        warning
                    </span>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider">Credit Limit Exceeded</p>
                        <p className="text-xs mt-0.5">
                            Outstanding balance of ₹{closingBalance.toLocaleString('en-IN')} exceeds the approved limit of ₹{creditLimit.toLocaleString('en-IN')} by ₹{(closingBalance - creditLimit).toLocaleString('en-IN')}. New orders require credit approval.
                        </p>
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 rounded-xl border text-xs flex items-center gap-2" style={{ background: T.surfaceHigh, borderColor: T.borderSubtle, color: T.textSecondary }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>info</span>
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Credit Limit */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: T.surface, borderColor: T.border }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Credit Limit</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>credit_card</span>
                    </div>
                    <p data-testid="account-credit-limit" className="text-xl font-black mt-2" style={{ color: T.textPrimary }}>
                        ₹{metrics.limit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                        Allowed Terms: {financials?.creditDays ?? 30} Days
                    </p>
                </div>

                {/* Total Outstanding */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: T.surface, borderColor: T.border }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Total Outstanding</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#8b5cf6' }}>account_balance_wallet</span>
                    </div>
                    <p data-testid="account-closing-balance" className="text-xl font-black mt-2" style={{ color: T.textPrimary }}>
                        ₹{metrics.balance.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                        Overdue Bills: {financials?.overdueBillsCount ?? 0}
                    </p>
                </div>

                {/* Available Credit */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: T.surface, borderColor: T.border }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Available Credit</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#10b981' }}>verified_user</span>
                    </div>
                    <p data-testid="account-available-credit" className="text-xl font-black mt-2" style={{ color: '#10b981' }}>
                        ₹{metrics.availableCredit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                        Unreserved Purchasing Power
                    </p>
                </div>

                {/* Aging Risk Badge */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: T.surface, borderColor: T.border }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Credit Risk Rating</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#f59e0b' }}>shield</span>
                    </div>
                    <div className="mt-2">
                        <span
                            data-testid="account-aging-risk-badge"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                            style={{
                                background: riskStyle.bg,
                                color: riskStyle.color,
                                borderColor: riskStyle.border,
                            }}
                        >
                            {riskLevel} RISK
                        </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                        Based on 5-tier overdue aging
                    </p>
                </div>
            </div>

            {/* Credit Utilization Progress Bar */}
            <div className="p-5 rounded-2xl border shadow-sm flex flex-col gap-2" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold" style={{ color: T.textSecondary }}>Credit Line Utilization</span>
                    <span className="font-black" style={{ color: barColor }}>
                        {metrics.utilizationPercent}% {metrics.isExceeded ? '(LIMIT EXCEEDED)' : 'utilized'}
                    </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: T.surfaceHigh }}>
                    <div
                        data-testid="account-credit-utilization-bar"
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${Math.min(100, metrics.utilizationPercent)}%`,
                            backgroundColor: barColor,
                        }}
                    />
                </div>
            </div>

            {/* 5-Tier Overdue Aging Grid */}
            <div className="p-5 rounded-2xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: T.textPrimary }}>
                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>schedule</span>
                        5-Tier Overdue Bill Aging Breakdown
                    </h4>
                    <span className="text-[11px]" style={{ color: T.textMuted }}>Values in INR (₹)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {/* Current (0-30 Days) */}
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Current (0-30d)</p>
                        <p data-testid="aging-current" className="text-sm font-black mt-1" style={{ color: T.textPrimary }}>
                            ₹{Number(aging.current || 0).toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* 31-60 Days */}
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>31-60 Days</p>
                        <p data-testid="aging-days-30" className="text-sm font-black mt-1" style={{ color: T.textPrimary }}>
                            ₹{Number(aging.days30 || 0).toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* 61-90 Days */}
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>61-90 Days</p>
                        <p data-testid="aging-days-60" className="text-sm font-black mt-1" style={{ color: '#f59e0b' }}>
                            ₹{Number(aging.days60 || 0).toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* 91-120 Days */}
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>91-120 Days</p>
                        <p data-testid="aging-days-90" className="text-sm font-black mt-1" style={{ color: '#ea580c' }}>
                            ₹{Number(aging.days90 || 0).toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* >120 Days (90+ Days) */}
                    <div className="p-3.5 rounded-xl border col-span-2 sm:col-span-1" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: '#ef4444' }}>&gt;120 Days</p>
                        <p data-testid="aging-days-90-plus" className="text-sm font-black mt-1" style={{ color: '#ef4444' }}>
                            ₹{Number(aging.days90Plus || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tally Master Metadata Footer */}
            <div className="p-4 rounded-xl border text-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" style={{ background: T.surfaceHigh, borderColor: T.borderSubtle }}>
                <div>
                    <span className="text-[10px] font-bold uppercase block" style={{ color: T.textMuted }}>Tally Ledger Name</span>
                    <span className="font-semibold" style={{ color: T.textPrimary }}>{financials?.tallyLedgerName || account?.name || 'Linked Ledger'}</span>
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase block" style={{ color: T.textMuted }}>GSTIN</span>
                    <span className="font-mono font-semibold" style={{ color: T.textPrimary }}>{financials?.gstin || account?.gstin || 'Unregistered'}</span>
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase block" style={{ color: T.textMuted }}>State Jurisdiction</span>
                    <span className="font-semibold" style={{ color: T.textPrimary }}>{financials?.stateName ? `${financials.stateName} (${financials.stateCode})` : (account?.stateCode || 'Not specified')}</span>
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase block" style={{ color: T.textMuted }}>Last Synced</span>
                    <span className="font-semibold" style={{ color: T.textPrimary }}>{financials?.lastTallySyncAt ? new Date(financials.lastTallySyncAt).toLocaleString() : 'Automated Sync Active'}</span>
                </div>
            </div>
        </div>
    )
}

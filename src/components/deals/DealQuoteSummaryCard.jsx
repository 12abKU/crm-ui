import React, { useEffect, useState } from 'react'
import tallyAPI from '../../api/tally'
import { computeGstSplit } from '../../utils/tallyGstUtils'
import { T } from '../../constants/theme'
import TallyConnectionBadge from './TallyConnectionBadge'

/**
 * DealQuoteSummaryCard
 * Embedded into DealPanelOverview.jsx to show immediate itemized quote totals
 * and link directly to the full Quote Builder tab.
 * 
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function DealQuoteSummaryCard({ deal, onOpenQuoteBuilder }) {
    const [lineItems, setLineItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [sellerGstin, setSellerGstin] = useState('')

    useEffect(() => {
        let isMounted = true
        const fetchSummary = async () => {
            if (!deal?.id) return
            setLoading(true)
            try {
                const [itemsRes, configRes] = await Promise.allSettled([
                    tallyAPI.getDealLineItems(deal.id),
                    tallyAPI.getConfig(),
                ])

                if (!isMounted) return

                if (itemsRes.status === 'fulfilled') {
                    const items = itemsRes.value?.data || itemsRes.value || []
                    setLineItems(Array.isArray(items) ? items : [])
                }
                if (configRes.status === 'fulfilled') {
                    const config = configRes.value?.data || configRes.value || {}
                    setSellerGstin(config.companyGstin || '')
                }
            } catch (err) {
                console.error('Error fetching quote summary:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchSummary()
        return () => {
            isMounted = false
        }
    }, [deal?.id])

    // Compute aggregated totals
    const buyerGstin = deal?.account?.gstin || ''
    let totalTaxable = 0
    let maxGstRate = 18.0

    lineItems.forEach(item => {
        const qty = Number(item.quantity) || 0
        const rate = Number(item.rate ?? item.unitPrice ?? 0)
        const discPct = Number(item.discountPercent) || 0
        const gross = qty * rate
        const discount = gross * (discPct / 100)
        totalTaxable += (gross - discount)
        if (item.taxRate || item.gstRate) {
            maxGstRate = Math.max(maxGstRate, Number(item.taxRate || item.gstRate))
        }
    })

    const taxSplit = computeGstSplit(sellerGstin, buyerGstin, totalTaxable, maxGstRate)

    return (
        <div className="p-5 rounded-2xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>receipt_long</span>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>Quotation & Line Items</h4>
                    <TallyConnectionBadge />
                </div>
                {onOpenQuoteBuilder && (
                    <button
                        type="button"
                        onClick={onOpenQuoteBuilder}
                        className="flex items-center gap-1 text-xs font-bold transition cursor-pointer"
                        style={{ color: T.primary }}
                    >
                        <span>Manage Quote</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-4 text-center text-xs" style={{ color: T.textMuted }}>Loading quote summary...</div>
            ) : lineItems.length === 0 ? (
                <div className="py-4 text-center flex flex-col items-center justify-center gap-2">
                    <p className="text-xs" style={{ color: T.textMuted }}>No line items added yet for this deal.</p>
                    {onOpenQuoteBuilder && (
                        <button
                            type="button"
                            onClick={onOpenQuoteBuilder}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                            style={{ background: T.primaryDim, color: T.primary }}
                        >
                            + Build Quote with Live Stock
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs" style={{ color: T.textSecondary }}>
                        <span>Items ({lineItems.length}):</span>
                        <span className="font-semibold" style={{ color: T.textPrimary }}>
                            {lineItems.map(i => i.itemName || i.productName).filter(Boolean).join(', ') || `${lineItems.length} items`}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                        <div className="p-2.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Taxable</p>
                            <p className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                ₹{taxSplit.exactGross > 0 ? (totalTaxable).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                            </p>
                        </div>

                        <div className="p-2.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                {taxSplit.isIntrastate ? 'CGST + SGST' : 'IGST'}
                            </p>
                            <p className="text-xs font-black mt-0.5" style={{ color: T.primary }}>
                                ₹{taxSplit.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="p-2.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Round-off</p>
                            <p className="text-xs font-black mt-0.5" style={{ color: T.textSecondary }}>
                                {taxSplit.roundOff >= 0 ? `+₹${taxSplit.roundOff.toFixed(2)}` : `-₹${Math.abs(taxSplit.roundOff).toFixed(2)}`}
                            </p>
                        </div>

                        <div className="p-2.5 rounded-xl border" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#10b981' }}>Net Payable</p>
                            <p className="text-xs font-black mt-0.5" style={{ color: '#10b981' }}>₹{taxSplit.netPayable.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

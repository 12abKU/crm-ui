import React, { useEffect, useState } from 'react'
import tallyAPI from '../../api/tally'
import {
    checkGodownAvailability,
    computeLineItemAmounts,
    computeGstSplit,
} from '../../utils/tallyGstUtils'
import { T } from '../../constants/theme'

/**
 * DealQuoteBuilder
 * Interactive Deal Line Items & Quote Builder with:
 * - Live Tally finished goods catalog & Godown availability
 * - Shortfall warnings when requestedQty > availableStock
 * - Real-time line item calculations (Gross, Discount, Taxable)
 * - Section 170 Indian GST splitting (Intrastate CGST/SGST vs Interstate IGST)
 * - Integer net payable round-off calculation
 * - Atomic persistence to backend
 * 
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function DealQuoteBuilder({ deal, onQuoteSaved, canEdit = true }) {
    const [lineItems, setLineItems] = useState([])
    const [inventory, setInventory] = useState([])
    const [godowns, setGodowns] = useState([])
    const [sellerGstin, setSellerGstin] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    // Load initial data
    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            if (!deal?.id) return
            setLoading(true)
            setErrorMsg(null)

            try {
                const [itemsRes, invRes, godownsRes, configRes] = await Promise.allSettled([
                    tallyAPI.getDealLineItems(deal.id),
                    tallyAPI.getInventory({ size: 100 }),
                    tallyAPI.getGodowns(),
                    tallyAPI.getConfig(),
                ])

                if (!isMounted) return

                if (itemsRes.status === 'fulfilled') {
                    const loadedItems = itemsRes.value?.data || itemsRes.value || []
                    setLineItems(
                        Array.isArray(loadedItems) && loadedItems.length > 0
                            ? loadedItems.map(item => ({
                                  id: item.id || `item-${Date.now()}-${Math.random()}`,
                                  itemName: item.itemName || item.productName || '',
                                  partNumber: item.partNumber || item.sku || '',
                                  godownName: item.godownName || 'Main Location',
                                  quantity: Number(item.quantity) || 1,
                                  rate: Number(item.rate ?? item.unitPrice ?? 0),
                                  discountPercent: Number(item.discountPercent) || 0,
                                  taxRate: Number(item.taxRate ?? item.gstRate ?? 18.0),
                              }))
                            : []
                    )
                }

                if (invRes.status === 'fulfilled') {
                    const invList = invRes.value?.data || invRes.value || []
                    setInventory(Array.isArray(invList) ? invList : [])
                }

                if (godownsRes.status === 'fulfilled') {
                    const gList = godownsRes.value?.data || godownsRes.value || []
                    setGodowns(Array.isArray(gList) ? gList : [])
                }

                if (configRes.status === 'fulfilled') {
                    const cfg = configRes.value?.data || configRes.value || {}
                    setSellerGstin(cfg.companyGstin || '')
                }
            } catch (err) {
                console.error('Failed to load quote builder data:', err)
                if (isMounted) setErrorMsg('Failed to load inventory or quote items.')
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadData()

        return () => {
            isMounted = false
        }
    }, [deal?.id])

    // Line items mutations
    const handleAddItem = (preset = null) => {
        const newItem = {
            id: `temp-${Date.now()}-${Math.random()}`,
            itemName: preset?.itemName || (inventory[0]?.itemName ?? ''),
            partNumber: preset?.partNumber || (inventory[0]?.partNumber ?? ''),
            godownName: godowns[0]?.name || godowns[0]?.godownName || 'Main Location',
            quantity: 1,
            rate: preset?.closingRate || inventory[0]?.closingRate || 100,
            discountPercent: 0,
            taxRate: preset?.gstRate || inventory[0]?.gstRate || 18.0,
        }
        setLineItems(prev => [...prev, newItem])
    }

    const handleUpdateItem = (id, field, value) => {
        setLineItems(prev =>
            prev.map(item => {
                if (item.id !== id) return item

                // Auto-fill rate, partNumber, taxRate on item selection
                if (field === 'itemName') {
                    const found = inventory.find(inv => inv.itemName === value)
                    return {
                        ...item,
                        itemName: value,
                        partNumber: found?.partNumber || item.partNumber,
                        rate: found?.closingRate ?? item.rate,
                        taxRate: found?.gstRate ?? item.taxRate,
                    }
                }

                return {
                    ...item,
                    [field]: field === 'quantity' || field === 'rate' || field === 'discountPercent' || field === 'taxRate'
                        ? Number(value)
                        : value,
                }
            })
        )
    }

    const handleDeleteItem = (id) => {
        setLineItems(prev => prev.filter(item => item.id !== id))
    }

    // Calculations & aggregation
    const buyerGstin = deal?.account?.gstin || ''
    let totalGross = 0
    let totalDiscount = 0
    let totalTaxable = 0
    let maxGstRate = 18.0

    const computedRows = lineItems.map(item => {
        const { gross, discount, taxable } = computeLineItemAmounts(
            item.quantity,
            item.rate,
            item.discountPercent
        )

        totalGross += gross
        totalDiscount += discount
        totalTaxable += taxable

        if (item.taxRate) {
            maxGstRate = Math.max(maxGstRate, Number(item.taxRate))
        }

        // Live godown stock availability
        const matchedCatalog = inventory.find(inv => inv.itemName === item.itemName)
        const availability = matchedCatalog
            ? checkGodownAvailability(matchedCatalog, item.godownName, item.quantity)
            : null

        return {
            ...item,
            gross,
            discount,
            taxable,
            availability,
        }
    })

    const gstSplit = computeGstSplit(sellerGstin, buyerGstin, totalTaxable, maxGstRate)

    const handleSaveQuote = async () => {
        if (!deal?.id) return
        setSaving(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const apiPayload = lineItems.map(item => ({
                itemName: item.itemName,
                partNumber: item.partNumber || '',
                godownName: item.godownName || 'Main Location',
                quantity: Number(item.quantity) || 1,
                rate: Number(item.rate) || 0,
                discountPercent: Number(item.discountPercent) || 0,
                taxRate: Number(item.taxRate) || 18.0,
            }))

            const res = await tallyAPI.setDealLineItems(deal.id, apiPayload)
            const savedData = res?.data || res || {}
            setSuccessMsg('Quote successfully saved and synchronized with Deal!')

            if (onQuoteSaved) {
                onQuoteSaved(savedData, gstSplit.netPayable)
            }
        } catch (err) {
            console.error('Failed to save quote:', err)
            setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to save quote items.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-sm" style={{ color: T.textMuted }}>
                <span className="material-symbols-outlined text-[28px] animate-spin block mb-2" style={{ color: T.primary }}>
                    sync
                </span>
                Loading Tally finished goods catalog and quote line items...
            </div>
        )
    }

    return (
        <div className="p-6 flex flex-col gap-6" style={{ color: T.textPrimary }}>
            {/* Header row */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: T.borderSubtle }}>
                <div>
                    <h3 className="text-base font-black" style={{ color: T.textPrimary }}>Manufacturing Deal Quote Builder</h3>
                    <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                        Configure itemized finished goods, select Godowns with live stock, and calculate Indian GST.
                    </p>
                </div>
                {canEdit && (
                    <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        style={{ background: T.primary }}
                        onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                        onMouseLeave={e => e.currentTarget.style.background = T.primary}
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Line Item
                    </button>
                )}
            </div>

            {/* Banners */}
            {errorMsg && (
                <div className="p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2" style={{ background: T.errorDim, borderColor: T.error + '40', color: T.error }}>
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{errorMsg}</span>
                </div>
            )}
            {successMsg && (
                <div className="p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2" style={{ background: T.successDim, borderColor: T.success + '40', color: T.success }}>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Line Items Table */}
            {lineItems.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3" style={{ background: T.surfaceRaised, borderColor: T.border }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: T.primaryDim, color: T.primary }}>
                        <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No products added to this quote yet</p>
                    <p className="text-xs max-w-sm" style={{ color: T.textMuted }}>
                        Select finished goods from your Tally catalog to reserve stock and generate Sales Orders.
                    </p>
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => handleAddItem()}
                            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer"
                            style={{ background: T.primary }}
                            onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                            onMouseLeave={e => e.currentTarget.style.background = T.primary}
                        >
                            + Add First Item
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border" style={{ background: T.surface, borderColor: T.border }}>
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b uppercase tracking-wider text-[10px]" style={{ background: T.surfaceHigh, borderColor: T.borderSubtle, color: T.textMuted }}>
                                <th className="p-3">Product / Stock Item</th>
                                <th className="p-3">Godown / Warehouse</th>
                                <th className="p-3 w-24">Qty</th>
                                <th className="p-3 w-28">Rate (₹)</th>
                                <th className="p-3 w-24">Disc %</th>
                                <th className="p-3 w-28 text-right">Taxable (₹)</th>
                                {canEdit && <th className="p-3 w-12 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {computedRows.map((row) => (
                                <tr key={row.id} className="transition" style={{ borderBottom: '1px solid ' + T.borderSubtle, color: T.textPrimary }}>
                                    {/* Product Selector */}
                                    <td className="p-3">
                                        {canEdit ? (
                                            <div className="flex flex-col gap-1">
                                                <select
                                                    value={row.itemName}
                                                    onChange={e => handleUpdateItem(row.id, 'itemName', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs outline-none"
                                                    style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                                >
                                                    {inventory.length > 0 ? (
                                                        inventory.map(inv => (
                                                            <option key={inv.itemName} value={inv.itemName} style={{ background: T.surface, color: T.textPrimary }}>
                                                                {inv.itemName} {inv.partNumber ? `(${inv.partNumber})` : ''}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value={row.itemName} style={{ background: T.surface, color: T.textPrimary }}>{row.itemName || 'Custom Item'}</option>
                                                    )}
                                                </select>
                                                {row.partNumber && (
                                                    <span className="text-[10px] font-mono" style={{ color: T.textMuted }}>
                                                        Part: {row.partNumber}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-bold" style={{ color: T.textPrimary }}>{row.itemName}</p>
                                                {row.partNumber && (
                                                    <p className="text-[10px] font-mono" style={{ color: T.textMuted }}>
                                                        {row.partNumber}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    {/* Godown Dropdown & Live Stock Badge */}
                                    <td className="p-3">
                                        <div className="flex flex-col gap-1">
                                            {canEdit ? (
                                                <select
                                                    value={row.godownName}
                                                    onChange={e => handleUpdateItem(row.id, 'godownName', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none"
                                                    style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                                >
                                                    {godowns.length > 0 ? (
                                                        godowns.map(g => (
                                                            <option key={g.id || g.name} value={g.name || g.godownName} style={{ background: T.surface, color: T.textPrimary }}>
                                                                {g.name || g.godownName}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value={row.godownName} style={{ background: T.surface, color: T.textPrimary }}>{row.godownName || 'Main Location'}</option>
                                                    )}
                                                </select>
                                            ) : (
                                                <span className="font-medium" style={{ color: T.textPrimary }}>{row.godownName}</span>
                                            )}

                                            {/* Godown stock availability pill */}
                                            {row.availability && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {row.availability.isAvailable ? (
                                                        <span
                                                            data-testid="quote-stock-badge"
                                                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border"
                                                            style={{
                                                                background: 'rgba(16, 185, 129, 0.12)',
                                                                borderColor: 'rgba(16, 185, 129, 0.35)',
                                                                color: '#10b981',
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[10px]">check</span>
                                                            In Stock: {row.availability.availableStock} Nos
                                                        </span>
                                                    ) : (
                                                        <span
                                                            data-testid="quote-stock-badge"
                                                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border"
                                                            style={{
                                                                background: 'rgba(245, 158, 11, 0.12)',
                                                                borderColor: 'rgba(245, 158, 11, 0.35)',
                                                                color: '#f59e0b',
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                                            Stock Shortfall: {row.availability.shortfall} Nos (Available: {row.availability.availableStock})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Quantity */}
                                    <td className="p-3">
                                        {canEdit ? (
                                            <input
                                                type="number"
                                                min="1"
                                                value={row.quantity}
                                                onChange={e => handleUpdateItem(row.id, 'quantity', e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border text-xs font-medium text-right outline-none"
                                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                            />
                                        ) : (
                                            <span className="font-semibold">{row.quantity}</span>
                                        )}
                                    </td>

                                    {/* Unit Rate */}
                                    <td className="p-3">
                                        {canEdit ? (
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={row.rate}
                                                onChange={e => handleUpdateItem(row.id, 'rate', e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border text-xs font-medium text-right outline-none"
                                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                            />
                                        ) : (
                                            <span>₹{row.rate.toFixed(2)}</span>
                                        )}
                                    </td>

                                    {/* Discount % */}
                                    <td className="p-3">
                                        {canEdit ? (
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={row.discountPercent}
                                                onChange={e => handleUpdateItem(row.id, 'discountPercent', e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border text-xs font-medium text-right outline-none"
                                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                            />
                                        ) : (
                                            <span>{row.discountPercent}%</span>
                                        )}
                                    </td>

                                    {/* Taxable Amount */}
                                    <td className="p-3 text-right font-black" style={{ color: T.textPrimary }}>
                                        ₹{row.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>

                                    {/* Delete Row Button */}
                                    {canEdit && (
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteItem(row.id)}
                                                className="p-1 rounded-lg transition cursor-pointer"
                                                style={{ color: T.textMuted }}
                                                onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                                                onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}
                                                title="Remove line item"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Real-time GST & Net Payable Summary Card */}
            <div className="p-5 rounded-2xl border flex flex-col gap-4 shadow-sm" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                        Indian GST Tax Breakdown ({gstSplit.isIntrastate ? 'Intrastate 50/50' : 'Interstate 100%'})
                    </span>
                    <span className="text-[11px]" style={{ color: T.textMuted }}>
                        Seller: <span className="font-mono font-bold" style={{ color: T.textPrimary }}>{gstSplit.sellerState}</span> | Buyer:{' '}
                        <span className="font-mono font-bold" style={{ color: T.textPrimary }}>{gstSplit.buyerState}</span>
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Gross Total</p>
                        <p className="text-xs font-bold mt-1" style={{ color: T.textPrimary }}>₹{totalGross.toFixed(2)}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Discount</p>
                        <p className="text-xs font-bold mt-1" style={{ color: T.textPrimary }}>₹{totalDiscount.toFixed(2)}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Taxable</p>
                        <p data-testid="quote-taxable-amount" className="text-xs font-black mt-1" style={{ color: T.textPrimary }}>
                            ₹{totalTaxable.toFixed(2)}
                        </p>
                    </div>

                    {gstSplit.isIntrastate ? (
                        <>
                            <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                                <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>CGST ({gstSplit.cgstRate}%)</p>
                                <p data-testid="quote-cgst-amount" className="text-xs font-black mt-1" style={{ color: T.primary }}>
                                    ₹{gstSplit.cgstAmount.toFixed(2)}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                                <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>SGST ({gstSplit.sgstRate}%)</p>
                                <p data-testid="quote-sgst-amount" className="text-xs font-black mt-1" style={{ color: T.primary }}>
                                    ₹{gstSplit.sgstAmount.toFixed(2)}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="p-3.5 rounded-xl border col-span-2" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                            <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>IGST ({gstSplit.igstRate}%)</p>
                            <p data-testid="quote-igst-amount" className="text-xs font-black mt-1" style={{ color: '#8b5cf6' }}>
                                ₹{gstSplit.igstAmount.toFixed(2)}
                            </p>
                        </div>
                    )}

                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Round Off</p>
                        <p data-testid="quote-roundoff-amount" className="text-xs font-bold mt-1" style={{ color: T.textSecondary }}>
                            {gstSplit.roundOff >= 0 ? `+₹${gstSplit.roundOff.toFixed(2)}` : `-₹${Math.abs(gstSplit.roundOff).toFixed(2)}`}
                        </p>
                    </div>
                </div>

                {/* Net Payable Banner & Save Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t" style={{ borderColor: T.borderSubtle }}>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            Net Payable (Section 170 CGST Act Round-off)
                        </p>
                        <p data-testid="quote-net-payable" className="text-2xl font-black mt-0.5" style={{ color: '#10b981' }}>
                            ₹{gstSplit.netPayable.toLocaleString('en-IN')}
                        </p>
                    </div>

                    {canEdit && (
                        <button
                            type="button"
                            data-testid="quote-save-btn"
                            onClick={handleSaveQuote}
                            disabled={saving || lineItems.length === 0}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-black text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
                            style={{ background: '#10b981' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1.0'}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {saving ? 'sync' : 'save'}
                            </span>
                            {saving ? 'Saving Quote...' : 'Save Quote & Update Deal'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

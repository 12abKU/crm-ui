/**
 * Pure calculation utilities for TallyPrime integration & GST calculations
 * Follows Section 170 CGST Act mathematical round-off rules
 */

export function checkGodownAvailability(item, requestedGodown, requestedQty) {
    if (!item) {
        return {
            availableStock: 0,
            isAvailable: false,
            shortfall: Number(requestedQty) || 0,
        }
    }
    const godown = item.godowns?.find(g => g.godownName === requestedGodown)
        || item.godownBalances?.find(g => g.godownName === requestedGodown)
    const availableStock = godown ? (godown.balance ?? godown.closingBalance ?? 0) : 0
    const req = Number(requestedQty) || 0
    const isAvailable = availableStock >= req
    const shortfall = Math.max(0, req - availableStock)
    return { availableStock, isAvailable, shortfall }
}

export function computeLineItemAmounts(quantity, unitRate, discountPercent = 0) {
    const qty = Number(quantity) || 0
    const rate = Number(unitRate) || 0
    const discPct = Math.max(0, Math.min(100, Number(discountPercent) || 0))

    const gross = Math.round(qty * rate * 100) / 100
    const discount = Math.round(gross * (discPct / 100) * 100) / 100
    const taxable = Math.round((gross - discount) * 100) / 100

    return { gross, discount, taxable }
}

export function computeGstSplit(sellerGstin, buyerGstin, taxableAmount, gstRate) {
    const sellerState = (sellerGstin && sellerGstin.length >= 2) ? sellerGstin.substring(0, 2) : '00'
    const buyerState = (buyerGstin && buyerGstin.length >= 2) ? buyerGstin.substring(0, 2) : '00'
    const isIntrastate = sellerState === buyerState

    const tax = Number(taxableAmount) || 0
    const rate = Number(gstRate) || 0

    let cgstRate = 0
    let sgstRate = 0
    let igstRate = 0
    let cgstAmount = 0
    let sgstAmount = 0
    let igstAmount = 0

    if (isIntrastate) {
        cgstRate = rate / 2
        sgstRate = rate / 2
        cgstAmount = Math.round((tax * (cgstRate / 100)) * 100) / 100
        sgstAmount = Math.round((tax * (sgstRate / 100)) * 100) / 100
    } else {
        igstRate = rate
        igstAmount = Math.round((tax * (igstRate / 100)) * 100) / 100
    }

    const totalGst = cgstAmount + sgstAmount + igstAmount
    const exactGross = tax + totalGst
    const netPayable = Math.round(exactGross)
    const roundOff = Math.round((netPayable - exactGross) * 100) / 100

    return {
        sellerState,
        buyerState,
        isIntrastate,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalGst,
        exactGross,
        roundOff,
        netPayable,
    }
}

export function getStepperStepStatus(currentStatus, step) {
    const stageOrder = {
        'NONE': 0,
        'QUEUED': 1,
        'SALES_ORDER_CREATED': 2,
        'DISPATCHED': 3,
        'INVOICED': 4,
    }
    const currentLevel = stageOrder[currentStatus] || 0
    const stepLevel = stageOrder[step] || 0

    if (currentLevel > stepLevel) return 'COMPLETED'
    if (currentLevel === stepLevel) {
        if (currentStatus === 'INVOICED') return 'COMPLETED'
        return 'ACTIVE'
    }
    return 'PENDING'
}

export function calculateCreditMetrics(creditLimit, closingBalance) {
    const limit = Number(creditLimit) || 0
    const balance = Number(closingBalance) || 0
    const availableCredit = Math.max(0, limit - balance)
    const utilizationPercent = limit > 0 ? Math.min(100, Math.round((balance / limit) * 100)) : 0
    const isExceeded = balance > limit
    return { limit, balance, availableCredit, utilizationPercent, isExceeded }
}

export function evaluateAgingRisk(aging = {}) {
    if ((aging?.days90Plus || 0) > 0) return 'CRITICAL'
    if ((aging?.days60 || 0) > 0) return 'HIGH'
    if ((aging?.days30 || 0) > 0) return 'MEDIUM'
    return 'LOW'
}

export function validateTallyConfig(config = {}) {
    const errors = []
    if (!config?.tallyCompanyName?.trim()) errors.push('Tally Company Name is required')
    if (!['LOCAL_AGENT', 'CLOUD_SERVER'].includes(config?.syncMode)) errors.push('Invalid sync mode')
    if (config?.syncMode === 'CLOUD_SERVER' && !config?.serverUrl?.startsWith('http')) {
        errors.push('Valid Server URL required for Cloud mode')
    }
    if (!config?.companyGstin || config.companyGstin.length !== 15) {
        errors.push('15-digit GSTIN is required')
    }
    if (!config?.salesLedgerName?.trim()) errors.push('Sales Ledger is required')
    if (!config?.cgstLedgerName?.trim()) errors.push('CGST Ledger is required')
    if (!config?.sgstLedgerName?.trim()) errors.push('SGST Ledger is required')
    if (!config?.igstLedgerName?.trim()) errors.push('IGST Ledger is required')
    return errors
}

export function isTallyConfigPermitted(role) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN'
}

export default {
    checkGodownAvailability,
    computeLineItemAmounts,
    computeGstSplit,
    getStepperStepStatus,
    calculateCreditMetrics,
    evaluateAgingRisk,
    validateTallyConfig,
    isTallyConfigPermitted,
}

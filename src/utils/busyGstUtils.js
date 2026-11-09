/**
 * Pure calculation utilities for BUSY ERP integration & GST calculations
 * Follows Section 170 CGST Act mathematical round-off rules
 */

export function checkMaterialCenterAvailability(item, requestedMaterialCenter, requestedQty) {
    if (!item) {
        return {
            availableStock: 0,
            isAvailable: false,
            shortfall: Number(requestedQty) || 0,
        }
    }

    const target = requestedMaterialCenter || 'Main Store'
    const centers = item.materialCenterBalances || item.materialCenters || item.godowns || item.godownBalances || []

    const center = centers.find(c => 
        (c.centerName && c.centerName.trim().toLowerCase() === target.trim().toLowerCase()) ||
        (c.materialCenterName && c.materialCenterName.trim().toLowerCase() === target.trim().toLowerCase()) ||
        (c.name && c.name.trim().toLowerCase() === target.trim().toLowerCase()) ||
        (c.godownName && c.godownName.trim().toLowerCase() === target.trim().toLowerCase())
    )

    let availableStock = 0
    if (center) {
        availableStock = Number(center.balance ?? center.closingBalance ?? center.stock ?? 0)
    } else if (centers.length === 0 && (item.closingBalance != null || item.balance != null)) {
        // If item has no per-center breakdown, fall back to global item balance
        availableStock = Number(item.closingBalance ?? item.balance ?? 0)
    }

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

export function validateBusyConfig(config = {}) {
    const errors = []
    if (!config?.busyCompanyName?.trim()) errors.push('BUSY Company Name is required')
    if (!['LOCAL_AGENT', 'CLOUD_SERVER'].includes(config?.syncMode)) errors.push('Invalid sync mode')
    if (config?.syncMode === 'CLOUD_SERVER' && !config?.serverUrl?.startsWith('http')) {
        errors.push('Valid Server URL required for Cloud mode')
    }
    if (!config?.companyGstin || config.companyGstin.length !== 15) {
        errors.push('15-digit GSTIN is required')
    }
    if (!config?.salesAccountName?.trim()) errors.push('Sales Account is required')
    if (!config?.cgstAccountName?.trim()) errors.push('CGST Account is required')
    if (!config?.sgstAccountName?.trim()) errors.push('SGST Account is required')
    if (!config?.igstAccountName?.trim()) errors.push('IGST Account is required')
    return errors
}

export function isBusyConfigPermitted(role) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN'
}

export function formatBusyError(rawError) {
    if (!rawError) return 'Voucher sync failed in BUSY ERP'
    let cleaned = String(rawError)
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()

    if (cleaned.includes('ECONNREFUSED') || cleaned.includes(':981') || cleaned.includes('Port 981')) {
        return 'BUSY Bridge agent is unreachable on Port 981. Ensure BusyBridge.exe is running on the local host.'
    }
    if (cleaned.includes('Company not found') || cleaned.includes('Invalid Company Code')) {
        return 'Specified BUSY company code or name was not found. Please verify your company configuration in Settings.'
    }
    if (cleaned.includes('Material Center') || cleaned.includes('MCId')) {
        return 'Specified Material Center is not configured or active in BUSY ERP. Verify Material Center mappings.'
    }
    return cleaned
}

export default {
    checkMaterialCenterAvailability,
    computeLineItemAmounts,
    computeGstSplit,
    getStepperStepStatus,
    calculateCreditMetrics,
    evaluateAgingRisk,
    validateBusyConfig,
    isBusyConfigPermitted,
    formatBusyError,
}

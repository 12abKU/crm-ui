import api from './index'

/**
 * busyAPI
 * Client interface for BUSY ERP Integration REST endpoints (Milestone M4).
 * Mirroring tallyAPI for multi-ERP dynamic switching parity.
 */
export const busyAPI = {
    // ── Configuration ──────────────────────────────────────────────────
    getConfig: () => api.get('/api/busy/config'),
    saveConfig: (data) => api.post('/api/busy/config', data),
    updateConfig: (data) => api.post('/api/busy/config', data),

    // ── Multi-ERP Tenant Routing ───────────────────────────────────────
    getActiveErp: (companyId) => api.get(`/api/companies/${companyId}/erp`),
    setActiveErp: (companyId, erp) => api.post(`/api/companies/${companyId}/erp`, typeof erp === 'string' ? { activeErp: erp } : erp),

    // ── Inventory & Masters ────────────────────────────────────────────
    getItems: (params) => api.get('/api/busy/items', { params }),
    getInventory: (params) => api.get('/api/busy/inventory', { params }),
    getMaterialCenters: () => api.get('/api/busy/material-centers'),
    getGodowns: () => api.get('/api/busy/material-centers'), // Compatibility alias
    getMasters: () => api.get('/api/busy/masters'),
    getDiscoveredMasters: () => api.get('/api/busy/masters'),
    getLedgers: () => api.get('/api/busy/masters'), // Compatibility alias

    // ── Financials ─────────────────────────────────────────────────────
    getAccountFinancials: (accountId) => api.get(`/api/busy/accounts/${accountId}/financials`),

    // ── Deal Fulfillment & Order-to-Cash ───────────────────────────────
    getSyncStatus: (dealId) => api.get(`/api/busy/deals/${dealId}/sync-status`),
    getDealSyncStatus: (dealId) => api.get(`/api/busy/deals/${dealId}/sync-status`),
    createSalesOrder: (dealId) => api.post(`/api/busy/deals/${dealId}/sales-order`),
    triggerSalesOrder: (dealId) => api.post(`/api/busy/deals/${dealId}/sales-order`),
    dispatchDeal: (dealId, data = {}) => api.post(`/api/busy/deals/${dealId}/dispatch`, data),
    triggerDispatch: (dealId, data = {}) => api.post(`/api/busy/deals/${dealId}/dispatch`, data),
    invoiceDeal: (dealId, data = {}) => api.post(`/api/busy/deals/${dealId}/invoice`, data),
    triggerInvoice: (dealId, data = {}) => api.post(`/api/busy/deals/${dealId}/invoice`, data),
    retryDealSync: (dealId) => api.post(`/api/busy/deals/${dealId}/retry`),
    retrySync: (dealId) => api.post(`/api/busy/deals/${dealId}/retry`),

    // ── Dead-Letter Queue (DLQ) Management ─────────────────────────────
    getDlqMessages: (params) => api.get('/api/busy/dlq', { params }),
    retryDlqMessage: (id) => api.post(`/api/busy/dlq/${id}/retry`),
    clearDlqMessages: () => api.post('/api/busy/dlq/clear'),
    clearDlq: () => api.post('/api/busy/dlq/clear'),

    // ── Desktop Bridge Binary Download ─────────────────────────────────
    downloadBridge: () => api.get('/api/busy/download-bridge', { responseType: 'blob' }),

    // ── Line Items and Quote Endpoints (Multi-ERP Shared) ──────────────
    getDealLineItems: (dealId) => api.get(`/api/deals/${dealId}/items`),
    setDealLineItems: (dealId, items) => api.put(`/api/deals/${dealId}/items`, items),
    getDealQuoteSummary: (dealId) => api.get(`/api/deals/${dealId}/quote-summary`),
    calculateQuote: (data) => api.post('/api/deals/calculate-quote', data),
}

// ── Named Function Exports for Direct Destructuring ────────────────────
export const getConfig = busyAPI.getConfig
export const saveConfig = busyAPI.saveConfig
export const updateConfig = busyAPI.updateConfig
export const getActiveErp = busyAPI.getActiveErp
export const setActiveErp = busyAPI.setActiveErp
export const getItems = busyAPI.getItems
export const getInventory = busyAPI.getInventory
export const getMaterialCenters = busyAPI.getMaterialCenters
export const getGodowns = busyAPI.getGodowns
export const getMasters = busyAPI.getMasters
export const getDiscoveredMasters = busyAPI.getDiscoveredMasters
export const getLedgers = busyAPI.getLedgers
export const getAccountFinancials = busyAPI.getAccountFinancials
export const getSyncStatus = busyAPI.getSyncStatus
export const getDealSyncStatus = busyAPI.getDealSyncStatus
export const createSalesOrder = busyAPI.createSalesOrder
export const triggerSalesOrder = busyAPI.triggerSalesOrder
export const dispatchDeal = busyAPI.dispatchDeal
export const triggerDispatch = busyAPI.triggerDispatch
export const invoiceDeal = busyAPI.invoiceDeal
export const triggerInvoice = busyAPI.triggerInvoice
export const retryDealSync = busyAPI.retryDealSync
export const retrySync = busyAPI.retrySync
export const getDlqMessages = busyAPI.getDlqMessages
export const retryDlqMessage = busyAPI.retryDlqMessage
export const clearDlqMessages = busyAPI.clearDlqMessages
export const clearDlq = busyAPI.clearDlq
export const downloadBridge = busyAPI.downloadBridge
export const getDealLineItems = busyAPI.getDealLineItems
export const setDealLineItems = busyAPI.setDealLineItems
export const getDealQuoteSummary = busyAPI.getDealQuoteSummary
export const calculateQuote = busyAPI.calculateQuote

export default busyAPI

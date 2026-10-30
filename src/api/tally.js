import api from './index'

export const tallyAPI = {
    getConfig: () => api.get('/api/tally/config'),
    updateConfig: (data) => api.post('/api/tally/config', data),
    getInventory: (params) => api.get('/api/tally/inventory', { params }),
    getGodowns: () => api.get('/api/tally/godowns'),
    getAccountFinancials: (accountId) => api.get(`/api/tally/accounts/${accountId}/financials`),
    getDealSyncStatus: (dealId) => api.get(`/api/tally/deals/${dealId}/sync-status`),
    createSalesOrder: (dealId) => api.post(`/api/tally/deals/${dealId}/sales-order`),
    dispatchDeal: (dealId, data = {}) => api.post(`/api/tally/deals/${dealId}/dispatch`, data),
    invoiceDeal: (dealId, data = {}) => api.post(`/api/tally/deals/${dealId}/invoice`, data),
    retryDealSync: (dealId) => api.post(`/api/tally/deals/${dealId}/retry`),
    getDlqMessages: (params) => api.get('/api/tally/dlq', { params }),
    retryDlqMessage: (id) => api.post(`/api/tally/dlq/${id}/retry`),

    // Line item and quote endpoints
    getDealLineItems: (dealId) => api.get(`/api/deals/${dealId}/items`),
    setDealLineItems: (dealId, items) => api.put(`/api/deals/${dealId}/items`, items),
    getDealQuoteSummary: (dealId) => api.get(`/api/deals/${dealId}/quote-summary`),
    calculateQuote: (data) => api.post('/api/deals/calculate-quote', data),
}

export const getConfig = tallyAPI.getConfig
export const updateConfig = tallyAPI.updateConfig
export const getInventory = tallyAPI.getInventory
export const getGodowns = tallyAPI.getGodowns
export const getAccountFinancials = tallyAPI.getAccountFinancials
export const getDealSyncStatus = tallyAPI.getDealSyncStatus
export const dispatchDeal = tallyAPI.dispatchDeal
export const invoiceDeal = tallyAPI.invoiceDeal
export const retryDealSync = tallyAPI.retryDealSync
export const getDlqMessages = tallyAPI.getDlqMessages
export const retryDlqMessage = tallyAPI.retryDlqMessage
export const getDealLineItems = tallyAPI.getDealLineItems
export const setDealLineItems = tallyAPI.setDealLineItems
export const getDealQuoteSummary = tallyAPI.getDealQuoteSummary
export const calculateQuote = tallyAPI.calculateQuote

export default tallyAPI

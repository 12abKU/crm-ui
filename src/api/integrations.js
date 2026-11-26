import api from './index'

export const companyIntegrationsAPI = {
    getIntegrations: () => api.get('/api/company/integrations'),
    regenerateWebhookKey: () => api.post('/api/company/integrations/webhook-key/regenerate'),
    updateIndiamart: (data) => api.put('/api/company/integrations/indiamart', data),
    clearIndiamart: () => api.delete('/api/company/integrations/indiamart'),
    syncIndiamartNow: () => api.post('/api/company/integrations/indiamart/sync'),
    updateSulekha: (data) => api.put('/api/company/integrations/sulekha', data),
    clearSulekha: () => api.delete('/api/company/integrations/sulekha'),

    // Outlook & Meta Lead Ads
    updateOutlook: (data) => api.put('/api/company/integrations/outlook', data),
    getOutlookStatus: () => api.get('/api/integrations/outlook/status'),
    getOutlookAuthUrl: () => api.get('/api/integrations/outlook/auth-url'),
    syncOutlookMail: () => api.post('/api/integrations/outlook/sync-mail'),
    syncOutlookCalendar: () => api.post('/api/integrations/outlook/sync-calendar'),
    disconnectOutlook: () => api.delete('/api/integrations/outlook/disconnect'),
    updateMeta: (data) => api.put('/api/company/integrations/meta', data),

    // Outbound Webhooks
    listOutboundWebhooks: () => api.get('/api/webhooks/outbound'),
    createOutboundWebhook: (data) => api.post('/api/webhooks/outbound', data),
    toggleOutboundWebhook: (id, active) => api.patch(`/api/webhooks/outbound/${id}`, { active }),
    deleteOutboundWebhook: (id) => api.delete(`/api/webhooks/outbound/${id}`),
    testOutboundWebhook: (id) => api.post(`/api/webhooks/outbound/${id}/test`),
    getOutboundWebhookLogs: (id) => api.get(`/api/webhooks/outbound/${id}/logs`),
}

export default companyIntegrationsAPI

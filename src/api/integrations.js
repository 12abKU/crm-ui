import api from './index'

export const companyIntegrationsAPI = {
    /**
     * Fetch integration credentials and status for current tenant company
     */
    getIntegrations: () => api.get('/api/company/integrations'),

    /**
     * Regenerate inbound webhook API key
     */
    regenerateWebhookKey: () => api.post('/api/company/integrations/webhook-key/regenerate'),

    /**
     * Save IndiaMart CRM Key
     * @param {{ crmKey: string, enabled: boolean }} data
     */
    updateIndiamart: (data) => api.put('/api/company/integrations/indiamart', data),

    /**
     * Clear IndiaMart configuration
     */
    clearIndiamart: () => api.delete('/api/company/integrations/indiamart'),

    /**
     * Trigger immediate on-demand IndiaMART sync
     */
    syncIndiamartNow: () => api.post('/api/company/integrations/indiamart/sync'),

    /**
     * Save Sulekha Webhook Secret
     * @param {{ webhookSecret: string, enabled: boolean }} data
     */
    updateSulekha: (data) => api.put('/api/company/integrations/sulekha', data),

    /**
     * Clear Sulekha configuration
     */
    clearSulekha: () => api.delete('/api/company/integrations/sulekha'),
}

export default companyIntegrationsAPI

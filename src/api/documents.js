import api from './index';

export const documentAPI = {
  // Get all documents
  getAll: (params) => api.get('/api/documents', { params }),

  // Get document by ID
  getById: (id) => api.get(`/api/documents/${id}`),

  // Get documents by deal
  getByDeal: (dealId) => api.get(`/api/documents/deal/${dealId}`),

  // Get documents by account
  getByAccount: (accountId) => api.get(`/api/documents/account/${accountId}`),

  // Get documents by contact
  getByContact: (contactId) => api.get(`/api/documents/contact/${contactId}`),

  // Upload document
  upload: (formData) => api.post('/api/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Download document
  download: (id) => api.get(`/api/documents/${id}/download`, { responseType: 'blob' }),

  // Delete document
  delete: (id) => api.delete(`/api/documents/${id}`),
};

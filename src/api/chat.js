import api from './index';

export const chatAPI = {
  // Get chat history with a colleague (paginated)
  getHistory: (recipientId, page = 0, size = 20) => api.get(`/api/chat/messages/${recipientId}?page=${page}&size=${size}`),

  // Send a message (text and/or file attachment via FormData)
  sendMessage: (formData) => api.post('/api/chat/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Mark all messages from a sender as read
  markAsRead: (senderId) => api.put(`/api/chat/messages/read/${senderId}`),

  // Get unread count map (senderId -> count)
  getUnreadCounts: () => api.get('/api/chat/messages/unread'),

  // Download a chat attachment by message ID
  downloadAttachment: (messageId) => api.get(`/api/chat/messages/${messageId}/download`, { responseType: 'blob' }),

  // Delete a message by message ID
  deleteMessage: (messageId) => api.delete(`/api/chat/messages/${messageId}`),

  // Bulk delete multiple messages
  deleteMessagesBulk: (ids) => api.delete('/api/chat/messages/bulk', { data: ids }),

  // Clear chat history with a colleague
  clearChat: (recipientId) => api.delete(`/api/chat/messages/clear/${recipientId}`),
};

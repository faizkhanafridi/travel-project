import { api } from '../../../lib/api';

export const messagingService = {
  listConversations: (params) =>
    api.get('/messaging/conversations', { params }).then((r) => r.data),
  startConversation: (payload) =>
    api.post('/messaging/conversations', payload).then((r) => r.data),
  showConversation: (uuid) =>
    api.get(`/messaging/conversations/${uuid}`).then((r) => r.data),
  listMessages: (uuid, params) =>
    api
      .get(`/messaging/conversations/${uuid}/messages`, { params })
      .then((r) => r.data),
  sendMessage: (uuid, payload) =>
    api.post(`/messaging/conversations/${uuid}/messages`, payload).then((r) => r.data),
  markRead: (uuid) =>
    api.post(`/messaging/conversations/${uuid}/read`).then((r) => r.data),
  unreadCount: (uuid) =>
    api.get(`/messaging/conversations/${uuid}/unread`).then((r) => r.data),
};
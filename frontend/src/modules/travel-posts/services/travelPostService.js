import { api } from '../../../lib/api';

export const travelPostService = {
  // Public
  listGlobal: (params) => api.get('/travel-post/posts', { params }).then((r) => r.data),
  showPost: (uuid) => api.get(`/travel-post/posts/${uuid}`).then((r) => r.data),

  // Customer
  createGlobal: (payload) => api.post('/travel-post/posts', payload).then((r) => r.data),
  myPosts: (params) => api.get('/travel-post/my/posts', { params }).then((r) => r.data),
  cancelPost: (uuid) => api.post(`/travel-post/posts/${uuid}/cancel`).then((r) => r.data),
  postOffers: (uuid, params) =>
    api.get(`/travel-post/posts/${uuid}/offers`, { params }).then((r) => r.data),

  // Service trip request
  requestTrip: (serviceUuid, payload) =>
    api.post(`/travel-post/services/${serviceUuid}/request-trip`, payload).then((r) => r.data),

  // Agent
  submitOffer: (postUuid, payload) =>
    api.post(`/travel-post/posts/${postUuid}/offers`, payload).then((r) => r.data),
  myOffers: (params) => api.get('/travel-post/my/offers', { params }).then((r) => r.data),
  withdrawOffer: (uuid) =>
    api.post(`/travel-post/offers/${uuid}/withdraw`).then((r) => r.data),
  agentServiceRequests: (params) =>
    api.get('/travel-post/agent/service-requests', { params }).then((r) => r.data),
  agentServiceRequest: (uuid) =>
    api.get(`/travel-post/agent/service-requests/${uuid}`).then((r) => r.data),

  // Customer decision
  decideOffer: (uuid, decision) =>
    api.post(`/travel-post/offers/${uuid}/decision`, { decision }).then((r) => r.data),

  // Connects
  connectPackages: () => api.get('/travel-post/connects/packages').then((r) => r.data),
  connectBalance: () => api.get('/travel-post/connects/balance').then((r) => r.data),
  buyConnects: (payload) => api.post('/travel-post/connects/buy', payload).then((r) => r.data),
};
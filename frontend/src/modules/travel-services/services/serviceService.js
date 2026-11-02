import { api } from '../../../lib/api';

export const serviceService = {
  // Public
  categories: () => api.get('/services/categories').then((r) => r.data),
  navigation: () => api.get('/services/navigation').then((r) => r.data),
  publicList: (params) => api.get('/services/', { params }).then((r) => r.data),
  publicShow: (uuid, params) =>
    api.get(`/services/${uuid}`, { params }).then((r) => r.data),
  imageUrl: (uuid) => `${import.meta.env.VITE_API_URL}/api/services/images/${uuid}`,

  // Currency
  currencyRates: () => api.get('/services/currency/').then((r) => r.data),

  // Agent wizard
  mine: (params) => api.get('/services/mine', { params }).then((r) => r.data),
  create: () => api.post('/services/mine').then((r) => r.data),
  show: (uuid) => api.get(`/services/mine/${uuid}`).then((r) => r.data),
  saveBasic: (uuid, payload) =>
    api.post(`/services/mine/${uuid}/basic`, payload).then((r) => r.data),
  saveDetails: (uuid, payload) =>
    api.post(`/services/mine/${uuid}/details`, payload).then((r) => r.data),
  uploadGallery: (uuid, formData) =>
    api
      .post(`/services/mine/${uuid}/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
  reorderGallery: (uuid, payload) =>
    api.patch(`/services/mine/${uuid}/gallery`, payload).then((r) => r.data),
  deleteImage: (uuid, imageUuid) =>
    api.delete(`/services/mine/${uuid}/gallery/${imageUuid}`).then((r) => r.data),
  saveRequirements: (uuid, payload) =>
    api.post(`/services/mine/${uuid}/requirements`, payload).then((r) => r.data),
  submit: (uuid) => api.post(`/services/mine/${uuid}/submit`).then((r) => r.data),
  requestRepublish: (uuid, reason) =>
    api.post(`/services/mine/${uuid}/request-republish`, { reason }).then((r) => r.data),
  destroy: (uuid) => api.delete(`/services/mine/${uuid}`).then((r) => r.data),

  // Admin
  adminList: (params) => api.get('/services/admin/services', { params }).then((r) => r.data),
  adminShow: (uuid) => api.get(`/services/admin/services/${uuid}`).then((r) => r.data),
  adminMarkUnderReview: (uuid) =>
    api.post(`/services/admin/services/${uuid}/under-review`).then((r) => r.data),
  adminApprove: (uuid) =>
    api.post(`/services/admin/services/${uuid}/approve`).then((r) => r.data),
  adminReject: (uuid, reason) =>
    api.post(`/services/admin/services/${uuid}/reject`, { reason }).then((r) => r.data),
  adminUnpublish: (uuid) =>
    api.post(`/services/admin/services/${uuid}/unpublish`).then((r) => r.data),
  adminSuspend: (uuid) =>
    api.post(`/services/admin/services/${uuid}/suspend`).then((r) => r.data),
  adminUnsuspend: (uuid) =>
    api.post(`/services/admin/services/${uuid}/unsuspend`).then((r) => r.data),
  adminApproveRepublish: (uuid) =>
    api.post(`/services/admin/republish-requests/${uuid}/approve`).then((r) => r.data),
  adminRejectRepublish: (uuid, reason) =>
    api
      .post(`/services/admin/republish-requests/${uuid}/reject`, { reason })
      .then((r) => r.data),
};
import axiosInstance from '../../../shared/lib/axios';

export const adminAgentService = {
  async list({ status, search, page = 1, perPage = 20 } = {}) {
    const { data } = await axiosInstance.get('/admin/agents', {
      params: { status, search, page, per_page: perPage },
    });
    return data;
  },

  async show(uuid) {
    const { data } = await axiosInstance.get(`/admin/agents/${uuid}`);
    return data;
  },

  async markUnderReview(uuid) {
    const { data } = await axiosInstance.post(`/admin/agents/${uuid}/under-review`);
    return data;
  },

  async approve(uuid) {
    const { data } = await axiosInstance.post(`/admin/agents/${uuid}/approve`);
    return data;
  },

  async reject(uuid, reason) {
    const { data } = await axiosInstance.post(`/admin/agents/${uuid}/reject`, {
      rejection_reason: reason,
    });
    return data;
  },

  async suspend(uuid, reason) {
    const { data } = await axiosInstance.post(`/admin/agents/${uuid}/suspend`, {
      reason,
    });
    return data;
  },

  async unsuspend(uuid) {
    const { data } = await axiosInstance.post(`/admin/agents/${uuid}/unsuspend`);
    return data;
  },

  documentDownloadUrl(agentUuid, docUuid) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${base}/api/admin/agents/${agentUuid}/documents/${docUuid}/download`;
  },
};
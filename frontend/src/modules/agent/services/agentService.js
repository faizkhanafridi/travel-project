import axiosInstance from '../../../shared/lib/axios';

export const agentService = {
  async getApplication() {
    const { data } = await axiosInstance.get('/agent/application');
    return data;
  },

  async startApplication() {
    const { data } = await axiosInstance.post('/agent/application/start');
    return data;
  },

  async saveAgency(payload) {
    const { data } = await axiosInstance.put('/agent/application/agency', payload);
    return data;
  },

  async saveBusiness(payload) {
    const { data } = await axiosInstance.put('/agent/application/business', payload);
    return data;
  },

  async saveBusinessHours(hours) {
    const { data } = await axiosInstance.put('/agent/application/business-hours', {
      hours,
    });
    return data;
  },

  async getReview() {
    const { data } = await axiosInstance.get('/agent/application/review');
    return data;
  },

  async submitApplication() {
    const { data } = await axiosInstance.post('/agent/application/submit');
    return data;
  },

  async uploadDocument({ type, file }) {
    const fd = new FormData();
    fd.append('type', type);
    fd.append('file', file);
    const { data } = await axiosInstance.post('/agent/documents', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteDocument(uuid) {
    const { data } = await axiosInstance.delete(`/agent/documents/${uuid}`);
    return data;
  },

  documentDownloadUrl(uuid) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${base}/api/agent/documents/${uuid}/download`;
  },
};
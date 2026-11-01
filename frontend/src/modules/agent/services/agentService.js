import { api } from "../../../lib/api";

export const agentService = {
  // Wizard (DRAFT / REJECTED)
  wizard: () => api.get("/agent/wizard").then((r) => r.data),

  saveAgency: (payload) =>
    api.post("/agent/wizard/agency", payload).then((r) => r.data),

  saveBusiness: (payload) =>
    api.post("/agent/wizard/business", payload).then((r) => r.data),

  uploadDocuments: (formData) =>
    api
      .post("/agent/wizard/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  saveHours: (payload) =>
    api.post("/agent/wizard/hours", payload).then((r) => r.data),

  submit: () => api.post("/agent/wizard/submit").then((r) => r.data),


  // Approved account (APPROVED only)
  account: () => api.get("/agent/account").then((r) => r.data),

  updateAgency: (payload) =>
    api.patch("/agent/account/agency", payload).then((r) => r.data),

  updateBusiness: (payload) =>
    api.patch("/agent/account/business", payload).then((r) => r.data),

  updateHours: (payload) =>
    api.patch("/agent/account/hours", payload).then((r) => r.data),

  // Document URL — open in new tab with cookie auth (fetch → blob)
  async viewDocument(url) {
    const res = await api.get(url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(res.data);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  },

  // Public
  publicList: (params) =>
    api.get("/agent/public", { params }).then((r) => r.data),

  publicShow: (uuid) => api.get(`/agent/public/${uuid}`).then((r) => r.data),

  // Admin
  adminList: (params) =>
    api.get("/agent/admin/applications", { params }).then((r) => r.data),

  adminShow: (uuid) =>
    api.get(`/agent/admin/applications/${uuid}`).then((r) => r.data),

  adminMarkUnderReview: (uuid) =>
    api
      .post(`/agent/admin/applications/${uuid}/under-review`)
      .then((r) => r.data),

  adminApprove: (uuid) =>
    api.post(`/agent/admin/applications/${uuid}/approve`).then((r) => r.data),
  
  adminReject: (uuid, reason) =>
    api
      .post(`/agent/admin/applications/${uuid}/reject`, { reason })
      .then((r) => r.data),
};

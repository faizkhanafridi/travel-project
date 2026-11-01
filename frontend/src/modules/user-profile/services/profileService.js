import { api } from "../../../lib/api";

export const profileService = {
  show: () => api.get("/user-profile/").then((r) => r.data),

  update: (formData) =>
    api
      .post("/user-profile/?_method=PATCH", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  publicShow: (uuid) =>
    api.get(`/user-profile/public/${uuid}`).then((r) => r.data),

  // Resolves the current user's approved agent UUID (null if not an agent).
  myAgent: () =>
    api
      .get("/agent/account")
      .then((r) => r.data)
      .catch(() => ({ data: null })),

  emailStatus: () => api.get("/user-profile/email/status").then((r) => r.data),

  startEmailChange: (payload) =>
    api.post("/user-profile/email/start", payload).then((r) => r.data),

  startEmailChangeWithPassword: (payload) =>
    api
      .post("/user-profile/email/start-with-password", payload)
      .then((r) => r.data),

  verifyCurrentEmail: (payload) =>
    api.post("/user-profile/email/verify-current", payload).then((r) => r.data),

  verifyNewEmail: (payload) =>
    api.post("/user-profile/email/verify-new", payload).then((r) => r.data),
  
  cancelEmailChange: () =>
    api.delete("/user-profile/email/cancel").then((r) => r.data),
};

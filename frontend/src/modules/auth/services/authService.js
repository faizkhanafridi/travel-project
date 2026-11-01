// src/modules/auth/services/authService.js
import { api } from '../../../lib/api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload).then((r) => r.data),
  resendVerification: (payload) =>
    api.post('/auth/resend-verification', payload).then((r) => r.data),

  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),

  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((r) => r.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((r) => r.data),
  setPassword: (payload) => api.post('/auth/set-password', payload).then((r) => r.data),
  changePassword: (payload) => api.post('/auth/change-password', payload).then((r) => r.data),

  chooseRole: (payload) => api.post('/auth/onboarding/choose-role', payload).then((r) => r.data),
  skipOnboarding: () => api.post('/auth/onboarding/skip').then((r) => r.data),

  mfaSetup: () => api.post('/auth/mfa/setup').then((r) => r.data),
  mfaConfirm: (payload) => api.post('/auth/mfa/confirm', payload).then((r) => r.data),
  mfaVerify: (payload) => api.post('/auth/mfa/verify', payload).then((r) => r.data),
  mfaDisable: () => api.post('/auth/mfa/disable').then((r) => r.data),

  socialRedirect: (provider) =>
    api.get(`/auth/social/${provider}/redirect`).then((r) => r.data),
};
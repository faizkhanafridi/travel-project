import axiosInstance from '../../../shared/lib/axios';

export const authService = {
  async me() {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  async register(payload) {
    const { data } = await axiosInstance.post('/auth/register', payload);
    return data;
  },

  async verifyEmail(payload) {
    const { data } = await axiosInstance.post('/auth/verify-email', payload);
    return data;
  },

  async resendVerification(payload) {
    const { data } = await axiosInstance.post('/auth/resend-verification', payload);
    return data;
  },

  async login(payload) {
    const { data } = await axiosInstance.post('/auth/login', payload);
    return data;
  },

  async logout() {
    const { data } = await axiosInstance.post('/auth/logout');
    return data;
  },

  async forgotPassword(payload) {
    const { data } = await axiosInstance.post('/auth/forgot-password', payload);
    return data;
  },

  async resetPassword(payload) {
    const { data } = await axiosInstance.post('/auth/reset-password', payload);
    return data;
  },

  async changePassword(payload) {
    const { data } = await axiosInstance.post('/auth/change-password', payload);
    return data;
  },

async setPassword(payload) {
  // Authenticated flow (logged-in social-only user)
  const { data } = await axiosInstance.post('/auth/set-password', payload);
  return data;
},

async setPasswordWithToken(payload) {
  // Public flow (email link with token + email)
  const { data } = await axiosInstance.post('/auth/set-password-with-token', payload);
  return data;
},
  async chooseRole(payload) {
    const { data } = await axiosInstance.post('/auth/onboarding/choose-role', payload);
    return data;
  },

  socialRedirectUrl(provider) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${base}/auth/social/${provider}/redirect`;
  },
};
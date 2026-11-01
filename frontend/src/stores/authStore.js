import { create } from 'zustand';

// Backend state flags:
// - user: null | AuthUserResource
// - requiresMfa: true when backend returns 401 { requires_mfa: true } (pending 2FA challenge)
export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  requiresMfa: false,

  setUser: (user) => set({ user, isLoading: false, requiresMfa: false }),
  clearUser: () => set({ user: null, isLoading: false, requiresMfa: false }),
  setRequiresMfa: () => set({ user: null, isLoading: false, requiresMfa: true }),
  setLoading: (isLoading) => set({ isLoading }),
}));
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user, ready: true }),
  clearUser: () => set({ user: null, ready: true }),
  setReady: (ready) => set({ ready }),
  patchUser: (partial) =>
    set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
}));

export default useAuthStore;
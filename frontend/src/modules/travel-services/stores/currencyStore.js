import { create } from 'zustand';

const KEY = 'tm.currency';

function readInitial() {
  if (typeof window === 'undefined') return 'USD';
  return localStorage.getItem(KEY) || 'USD';
}

export const useCurrencyStore = create((set) => ({
  currency: readInitial(),
  setCurrency: (c) => {
    localStorage.setItem(KEY, c);
    set({ currency: c });
  },
}));
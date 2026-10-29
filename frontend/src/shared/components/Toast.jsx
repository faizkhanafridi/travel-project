import { create } from 'zustand';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const useToastStore = create((set) => ({
  items: [],
  push: (toast) => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items, { id, ...toast }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, toast.duration || 4200);
  },
  remove: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message) => useToastStore.getState().push({ type: 'success', message }),
  error: (message) => useToastStore.getState().push({ type: 'error', message }),
  info: (message) => useToastStore.getState().push({ type: 'info', message }),
};

export default function Toaster() {
  const items = useToastStore((s) => s.items);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,380px)]">
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const colors =
    toast.type === 'success'
      ? 'border-success/30 bg-white'
      : toast.type === 'error'
      ? 'border-danger/30 bg-white'
      : 'border-ink-300 bg-white';
  const Icon = toast.type === 'success' ? CheckCircle2 : XCircle;
  const iconColor = toast.type === 'success' ? 'text-success' : 'text-danger';

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${colors} px-3 py-3 shadow-pop animate-[fadeIn_.2s_ease-out]`}
    >
      <Icon size={18} className={iconColor} />
      <p className="flex-1 text-sm text-ink-800">{toast.message}</p>
      <button onClick={onClose} className="text-ink-500 hover:text-ink-800" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
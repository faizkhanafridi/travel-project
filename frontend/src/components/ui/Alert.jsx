import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const styles = {
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
};

const icons = { error: AlertCircle, success: CheckCircle2, info: Info };

export default function Alert({ variant = 'error', children }) {
  const Icon = icons[variant] || Info;
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-fade-in ${styles[variant]}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
}
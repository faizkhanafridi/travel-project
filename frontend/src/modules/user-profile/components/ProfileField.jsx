export default function ProfileField({ label, error, hint, children }) {
  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function inputClass(error, disabled = false) {
  const base =
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4';
  if (disabled) {
    return `${base} border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed`;
  }
  return `${base} ${
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
  }`;
}
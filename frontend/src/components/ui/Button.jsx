import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md focus-visible:ring-brand-200',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm focus-visible:ring-slate-200',
    ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-200',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
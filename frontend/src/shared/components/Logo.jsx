import { Plane } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  return (
    <div className="flex items-center gap-2 select-none">
      {/* <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-white shadow-card">
        <Plane size={18} strokeWidth={2.4} />
      </span> */}
      <span className={`font-bold tracking-tight text-ink-900 ${sizes[size]}`}>
        Voyago
      </span>
    </div>
  );
}
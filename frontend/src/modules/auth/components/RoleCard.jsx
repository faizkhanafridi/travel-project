import { Briefcase, User } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

export default function RoleCard({ value, selected, onSelect, title, description }) {
  const Icon = value === 'agent' ? Briefcase : User;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex items-start gap-3 w-full text-left rounded-xl border p-4 transition-all focus-ring',
        selected
          ? 'border-primary bg-primary-light ring-4 ring-primary-ring/40'
          : 'border-ink-200 bg-white hover:border-ink-300'
      )}
    >
      <span
        className={cn(
          'grid place-items-center h-10 w-10 rounded-lg',
          selected ? 'bg-primary text-white' : 'bg-ink-100 text-ink-700'
        )}
      >
        <Icon size={20} />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-ink-900">{title}</span>
        <span className="block mt-0.5 text-sm text-ink-600">{description}</span>
      </span>
    </button>
  );
}
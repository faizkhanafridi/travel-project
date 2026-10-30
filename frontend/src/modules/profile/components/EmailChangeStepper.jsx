import { Check } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const steps = [
  { key: 'initiate', label: 'New email' },
  { key: 'current', label: 'Verify current' },
  { key: 'new', label: 'Verify new' },
];

export default function EmailChangeStepper({ current }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2 mb-4">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                'h-6 w-6 grid place-items-center rounded-full text-xs font-semibold',
                done
                  ? 'bg-primary text-white'
                  : active
                  ? 'bg-primary-light text-primary border border-primary'
                  : 'bg-ink-100 text-ink-500'
              )}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                active ? 'text-ink-900' : 'text-ink-500'
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="h-px w-4 bg-ink-200" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
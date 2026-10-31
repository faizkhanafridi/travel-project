import { Check } from 'lucide-react';
import { cn } from '../../../../shared/lib/utils';

const STEPS = [
  { key: 'agency', label: 'Agency' },
  { key: 'business', label: 'Business' },
  { key: 'documents', label: 'Documents' },
  { key: 'hours', label: 'Hours' },
  { key: 'review', label: 'Review' },
  { key: 'submit', label: 'Submit' },
];

export default function WizardStepper({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex flex-wrap gap-2 mb-8">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                'h-7 w-7 grid place-items-center rounded-full text-xs font-semibold',
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
            {i < STEPS.length - 1 && (
              <span className="h-px w-4 bg-ink-200" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
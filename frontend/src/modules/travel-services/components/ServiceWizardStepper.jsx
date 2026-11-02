import { Check } from 'lucide-react';

const STEPS = [
  { key: 'basic', label: 'Basic' },
  { key: 'details', label: 'Details' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'review', label: 'Review' },
];

export default function ServiceWizardStepper({ current, savedFlags = {}, onNavigate, hideReview = false }) {
  const steps = hideReview ? STEPS.filter((s) => s.key !== 'review') : STEPS;

  return (
    <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
      {steps.map((step, idx) => {
        const isDone = savedFlags[step.key];
        const isCurrent = current === idx;
        const clickable = idx <= Math.max(
          steps.findIndex((s) => !savedFlags[s.key]) === -1
            ? steps.length - 1
            : steps.findIndex((s) => !savedFlags[s.key]),
          0
        );

        return (
          <li key={step.key} className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => clickable && onNavigate?.(idx)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isCurrent
                  ? 'bg-brand-600 text-white'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-white text-slate-500 border border-slate-200'
              } ${clickable ? 'hover:opacity-90' : 'cursor-not-allowed opacity-60'}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent
                    ? 'bg-white text-brand-700'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && <div className="w-4 h-px bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}
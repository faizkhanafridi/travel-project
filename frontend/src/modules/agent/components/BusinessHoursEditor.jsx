import { useEffect, useState } from 'react';
import { cn } from '../../../shared/lib/utils';
import { Copy } from 'lucide-react';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Trim "HH:MM:SS", "HH:MM:SS.mmm", "HH:MM AM/PM" → "HH:MM"
function toHm(value) {
  if (!value || typeof value !== 'string') return '';
  const m = value.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : '';
}

export function buildDefaultHours() {
  return DAY_LABELS.map((_, day) => ({
    day_of_week: day,
    is_closed: false,
    open_time: '09:00',
    close_time: '17:00',
  }));
}

export function normalizeHours(hours) {
  if (!Array.isArray(hours) || hours.length !== 7) return buildDefaultHours();
  const map = new Map(hours.map((h) => [h.day_of_week, h]));
  return DAY_LABELS.map((_, day) => {
    const closed = !!map.get(day)?.is_closed;
    return {
      day_of_week: day,
      is_closed: closed,
      open_time: closed ? null : (toHm(map.get(day)?.open_time) || '09:00'),
      close_time: closed ? null : (toHm(map.get(day)?.close_time) || '17:00'),
    };
  });
}

export default function BusinessHoursEditor({ value, onChange, disabled }) {
  const [hours, setHours] = useState(value || buildDefaultHours());

  useEffect(() => {
    if (value) setHours(value);
  }, [JSON.stringify(value)]);

  const update = (idx, patch) => {
    const next = hours.map((h, i) => (i === idx ? { ...h, ...patch } : h));
    setHours(next);
    onChange(next);
  };

  const copyFirstToAll = () => {
    const first = hours[0];
    const next = hours.map((h) => ({
      ...h,
      is_closed: first.is_closed,
      open_time: first.open_time,
      close_time: first.close_time,
    }));
    setHours(next);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-ink-600">
          Configure your agency&apos;s weekly hours.
        </p>
        {!disabled && (
          <button
            type="button"
            onClick={copyFirstToAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Copy size={12} /> Copy Sunday to all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {hours.map((h, idx) => (
          <div
            key={h.day_of_week}
            className={cn(
              'grid grid-cols-[120px_1fr] gap-2 items-center rounded-lg border p-2',
              h.is_closed ? 'bg-ink-50 border-ink-100' : 'border-ink-200'
            )}
          >
            <span className="text-sm font-medium text-ink-800 pl-1">
              {DAY_LABELS[h.day_of_week]}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={h.is_closed}
                  disabled={disabled}
                  onChange={(e) => update(idx, { is_closed: e.target.checked })}
                  className="accent-primary"
                />
                Closed
              </label>
              <input
                type="time"
                value={h.open_time || ''}
                disabled={disabled || h.is_closed}
                onChange={(e) => update(idx, { open_time: e.target.value })}
                className="h-9 rounded-md border border-ink-300 px-2 text-sm disabled:opacity-50 focus-ring"
              />
              <span className="text-ink-400">–</span>
              <input
                type="time"
                value={h.close_time || ''}
                disabled={disabled || h.is_closed}
                onChange={(e) => update(idx, { close_time: e.target.value })}
                className="h-9 rounded-md border border-ink-300 px-2 text-sm disabled:opacity-50 focus-ring"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
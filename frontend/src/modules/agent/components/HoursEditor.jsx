const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function HoursEditor({ hours, onChange, errors = {}, disabled }) {
  const update = (dayIdx, patch) => {
    const next = hours.map((row, i) => (i === dayIdx ? { ...row, ...patch } : row));
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {hours.map((row, idx) => {
        const day = DAYS.find((d) => d.value === row.day_of_week);
        const rowError = errors?.[idx]?.close_time || errors?.[idx]?.open_time;
        return (
          <div
            key={row.day_of_week}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <div className="sm:col-span-3 font-semibold text-sm text-slate-800">
              {day?.label}
            </div>
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={row.is_closed}
                onChange={(e) =>
                  update(idx, {
                    is_closed: e.target.checked,
                    open_time: e.target.checked ? null : row.open_time,
                    close_time: e.target.checked ? null : row.close_time,
                  })
                }
                disabled={disabled}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Closed
            </label>
            <input
              type="time"
              value={row.open_time || ''}
              onChange={(e) => update(idx, { open_time: e.target.value })}
              disabled={disabled || row.is_closed}
              className="sm:col-span-3 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
            />
            <span className="hidden sm:block sm:col-span-1 text-center text-slate-400 text-sm">to</span>
            <input
              type="time"
              value={row.close_time || ''}
              onChange={(e) => update(idx, { close_time: e.target.value })}
              disabled={disabled || row.is_closed}
              className={`sm:col-span-3 rounded-lg border px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400 ${
                rowError ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {rowError && (
              <p className="sm:col-span-12 text-xs text-rose-600">{rowError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { DAYS };
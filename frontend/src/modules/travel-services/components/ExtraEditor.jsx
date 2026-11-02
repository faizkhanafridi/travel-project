import { Plus, X } from 'lucide-react';

export default function ExtraEditor({ value = [], onChange, disabled }) {
  const add = () => onChange([...value, { label: '', price: '', description: '' }]);
  const update = (idx, patch) =>
    onChange(value.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {value.map((e, idx) => (
        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 grid sm:grid-cols-12 gap-2 items-start">
          <input
            type="text"
            value={e.label}
            onChange={(ev) => update(idx, { label: ev.target.value })}
            placeholder="Extra label (e.g. Airport pickup)"
            disabled={disabled}
            className="sm:col-span-5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          />
          <input
            type="number"
            min="0"
            value={e.price}
            onChange={(ev) => update(idx, { price: ev.target.value })}
            placeholder="Price (USD)"
            disabled={disabled}
            className="sm:col-span-3 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          />
          <input
            type="text"
            value={e.description || ''}
            onChange={(ev) => update(idx, { description: ev.target.value })}
            placeholder="Description (optional)"
            disabled={disabled}
            className="sm:col-span-3 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => remove(idx)}
              className="sm:col-span-1 text-slate-400 hover:text-rose-600 py-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <Plus className="w-4 h-4" />
          Add optional paid extra
        </button>
      )}
    </div>
  );
}
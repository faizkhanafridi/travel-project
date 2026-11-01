import { useState } from 'react';

export default function TagInput({
  label,
  value = [],
  onChange,
  placeholder = 'Add item',
  maxItems = 20,
  error,
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || value.includes(v) || value.length >= maxItems) return;
    onChange([...value, v]);
    setInput('');
  };

  const remove = (item) => onChange(value.filter((v) => v !== item));

  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={`flex-1 rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="text-brand-700 hover:text-brand-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
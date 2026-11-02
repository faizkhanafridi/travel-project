import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";

const TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "file", label: "File upload" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
];

export default function RequirementBuilder({
  value = [],
  onChange,
  error,
  disabled,
}) {
  const add = () =>
    onChange([...value, { title: "", description: "", answer_type: "text" }]);

  const update = (idx, patch) => {
    onChange(value.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {value.map((r, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              Requirement #{idx + 1}
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-slate-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-600">
                Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={r.title}
                onChange={(e) => update(idx, { title: e.target.value })}
                disabled={disabled}
                placeholder="e.g. Passport scan"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-600">
                Answer type <span className="text-rose-600">*</span>
              </label>
              <select
                value={r.answer_type}
                onChange={(e) => update(idx, { answer_type: e.target.value })}
                disabled={disabled}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-600">
              Description
            </label>
            <textarea
              rows={2}
              value={r.description || ""}
              onChange={(e) => update(idx, { description: e.target.value })}
              disabled={disabled}
              placeholder="Explain what you need from the customer"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
            />
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={add}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-700"
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Add requirement
          </span>
        </button>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

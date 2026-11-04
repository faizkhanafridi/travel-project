import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function PostFiltersBar({
  q,
  onQChange,
  country,
  onCountryChange,
  city,
  onCityChange,
  budgetMin,
  onBudgetMinChange,
  budgetMax,
  onBudgetMaxChange,
  countries = [],
  cities = [],
  onClear,
  hasFilters,
  open,
  onToggle,
}) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Search by title, destination, keyword…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">Filters</p>
            {hasFilters && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Any country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                City
              </label>
              <select
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Any city</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Budget min (USD)
              </label>
              <input
                type="number"
                min="0"
                value={budgetMin}
                onChange={(e) => onBudgetMinChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Budget max (USD)
              </label>
              <input
                type="number"
                min="0"
                value={budgetMax}
                onChange={(e) => onBudgetMaxChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
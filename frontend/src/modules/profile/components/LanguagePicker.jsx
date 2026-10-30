import { Check, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../../shared/lib/utils';

export default function LanguagePicker({
  languages = [],
  value = [],
  onChange,
  loading,
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter((l) => l.name.toLowerCase().includes(q));
  }, [languages, query]);

const toggle = (id) => {
  const numId = typeof id === 'string' ? Number(id) : id;
  if (typeof numId !== 'number' || Number.isNaN(numId)) return;

  if (value.includes(numId)) {
    onChange(value.filter((v) => v !== numId));
  } else {
    onChange([...value, numId]);
  }
};
  return (
    <div className="w-full">
      <label className="block mb-1.5 text-sm font-medium text-ink-800">
        Languages
      </label>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages…"
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-ink-300 bg-white text-sm focus-ring"
        />
      </div>

      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-ink-200 bg-white p-2 grid sm:grid-cols-2 gap-1.5">
        {loading && (
          <p className="col-span-2 text-sm text-ink-500 px-2 py-1">Loading…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="col-span-2 text-sm text-ink-500 px-2 py-1">
            No languages match.
          </p>
        )}
        {filtered.map((l) => {
          const active = value.includes(l.id);
          return (
            <button
              key={l.uuid}
              type="button"
              onClick={() => toggle(l.id)}
              className={cn(
                'flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-left transition-colors',
                active
                  ? 'bg-primary-light text-primary font-medium'
                  : 'hover:bg-ink-50 text-ink-700'
              )}
            >
              <span>{l.name}</span>
              {active && <Check size={14} />}
            </button>
          );
        })}
      </div>

      <p className="mt-1 text-xs text-ink-500">
        Selected: {value.length}
      </p>
    </div>
  );
}
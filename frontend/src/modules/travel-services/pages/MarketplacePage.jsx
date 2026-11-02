import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import ServiceCard from '../components/ServiceCard';
import { useNavigation, usePublicServices } from '../hooks/useService';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'best_rated', label: 'Best rated', disabled: true },
  { value: 'most_reviewed', label: 'Most reviewed', disabled: true },
  { value: 'most_booked', label: 'Most booked', disabled: true },
];

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: navData } = useNavigation();
  const subcategories = navData?.data || [];

  const initialSub = searchParams.get('subcategory') || '';
  const initialQ = searchParams.get('q') || '';

  const [q, setQ] = useState(initialQ);
  const [subId, setSubId] = useState(initialSub);
  const [sort, setSort] = useState('recommended');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [durationMax, setDurationMax] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedQ = useDebounced(q, 400);

  const params = useMemo(() => {
    const p = { page, sort, per_page: 20 };
    if (debouncedQ) p.q = debouncedQ;
    if (subId) p.subcategory_id = subId;
    if (priceMin) p.price_min = priceMin;
    if (priceMax) p.price_max = priceMax;
    if (durationMin) p.duration_min = durationMin;
    if (durationMax) p.duration_max = durationMax;
    if (country) p.destination_country = country;
    if (city) p.destination_city = city;
    return p;
  }, [debouncedQ, subId, sort, priceMin, priceMax, durationMin, durationMax, country, city, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, subId, sort, priceMin, priceMax, durationMin, durationMax, country, city]);

  useEffect(() => {
    const next = {};
    if (subId) next.subcategory = subId;
    if (debouncedQ) next.q = debouncedQ;
    setSearchParams(next, { replace: true });
  }, [subId, debouncedQ, setSearchParams]);

  const { data, isLoading, error } = usePublicServices(params);
  const items = data?.data || [];
  const meta = data?.meta;

  const resetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setDurationMin('');
    setDurationMax('');
    setCountry('');
    setCity('');
  };

  const hasFilters =
    priceMin || priceMax || durationMin || durationMax || country || city;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Horizontal subcategory bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setSubId('')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold ${
                !subId
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {subcategories.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubId(String(s.id))}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold ${
                  String(subId) === String(s.id)
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search destinations, tour types, keywords…"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              )}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} disabled={s.disabled}>
                  {s.label}
                  {s.disabled ? ' (coming soon)' : ''}
                </option>
              ))}
            </select>
          </div>

          {filtersOpen && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900">Filters</p>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Destination country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Any country"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Destination city
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Any city"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Price min
                    </label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Price max
                    </label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:col-span-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Duration min
                    </label>
                    <input
                      type="number"
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Duration max
                    </label>
                    <input
                      type="number"
                      value={durationMax}
                      onChange={(e) => setDurationMax(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Rating, reviews, and agent level filters are coming soon.
              </p>
            </div>
          )}
        </div>

        {error && <Alert variant="error">Could not load services.</Alert>}

        {isLoading ? (
          <FullPageLoader label="Loading services…" />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              No services match your search. Try different keywords or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((s) => (
                <ServiceCard key={s.uuid} service={s} />
              ))}
            </div>

            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold disabled:opacity-50"
                >
                  Prev
                </button>
                <p className="text-sm text-slate-600">
                  Page {meta.current_page} of {meta.last_page}
                </p>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.last_page, p + 1))
                  }
                  disabled={meta.current_page >= meta.last_page}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
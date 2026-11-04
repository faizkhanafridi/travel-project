import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { useCategories } from '../../travel-services/hooks/useService';
import { globalPostSchema, DURATION_UNITS } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useCreateGlobalPost } from '../hooks/useTravelPost';

export default function CreateGlobalPostModal({ onClose, onCreated }) {
  const { data: catRes } = useCategories();
  const categories = catRes?.data || [];
  const create = useCreateGlobalPost();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    duration: 7,
    duration_unit: 'days',
    destination_country: '',
    destination_city: '',
    travel_date: '',
    travelers_total: 1,
    travelers_adults: 1,
    travelers_children: 0,
    budget_min: '',
    budget_max: '',
    services_needed: [],
    additional_requirements: '',
  });
  const [serviceInput, setServiceInput] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const cat = categories.find((c) => c.id === Number(form.category_id));
  const subs = cat?.subcategories || [];

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const addService = () => {
    const v = serviceInput.trim();
    if (!v || form.services_needed.includes(v)) return;
    setForm((f) => ({ ...f, services_needed: [...f.services_needed, v] }));
    setServiceInput('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const payload = {
      ...form,
      category_id: Number(form.category_id),
      subcategory_id: Number(form.subcategory_id),
    };
    const parsed = globalPostSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      setBanner('Please fix the highlighted fields.');
      return;
    }

    try {
      const result = await create.mutateAsync(parsed.data);
      onCreated?.(result.data);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  const fieldErr = (k) => {
    const v = errors[k];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Post a custom trip</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {banner && <Alert variant="error">{banner}</Alert>}

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. 10-Day Dubai Family Trip"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                errors.title
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-600">{fieldErr('title')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Description <span className="text-rose-600">*</span>
              <span className="text-xs font-normal text-slate-500 ml-1">(300–1200 chars)</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set('description')}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                errors.description
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-xs text-rose-600">{fieldErr('description')}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-slate-400">{form.description.length}/1200</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: '' }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErr('category_id')}</p>
              )}
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Subcategory <span className="text-rose-600">*</span>
              </label>
              <select
                value={form.subcategory_id}
                onChange={set('subcategory_id')}
                disabled={!cat}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                <option value="">Select subcategory…</option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.subcategory_id && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErr('subcategory_id')}</p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Duration <span className="text-rose-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={set('duration')}
                  className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
                <select
                  value={form.duration_unit}
                  onChange={set('duration_unit')}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                >
                  {DURATION_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Expected date
              </label>
              <input
                type="date"
                value={form.travel_date}
                onChange={set('travel_date')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Destination country <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={form.destination_country}
                onChange={set('destination_country')}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                  errors.destination_country
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {errors.destination_country && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErr('destination_country')}</p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Destination city <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={form.destination_city}
                onChange={set('destination_city')}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                  errors.destination_city
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {errors.destination_city && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErr('destination_city')}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Travelers total
              </label>
              <input
                type="number"
                min="1"
                value={form.travelers_total}
                onChange={set('travelers_total')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">Adults</label>
              <input
                type="number"
                min="1"
                value={form.travelers_adults}
                onChange={set('travelers_adults')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">Children</label>
              <input
                type="number"
                min="0"
                value={form.travelers_children}
                onChange={set('travelers_children')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Budget min (USD)
              </label>
              <input
                type="number"
                min="0"
                value={form.budget_min}
                onChange={set('budget_min')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Budget max (USD)
              </label>
              <input
                type="number"
                min="0"
                value={form.budget_max}
                onChange={set('budget_max')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Services needed
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addService();
                  }
                }}
                placeholder="e.g. Hotel, Airport pickup"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              <Button type="button" variant="secondary" onClick={addService}>
                Add
              </Button>
            </div>
            {form.services_needed.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.services_needed.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          services_needed: f.services_needed.filter((x) => x !== s),
                        }))
                      }
                      className="text-brand-700 hover:text-brand-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Additional requirements
            </label>
            <textarea
              rows={3}
              value={form.additional_requirements}
              onChange={set('additional_requirements')}
              placeholder="Any special preferences or constraints?"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Post trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
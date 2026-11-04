import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { serviceTripRequestSchema, DURATION_UNITS } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useRequestTrip } from '../hooks/useTravelPost';

export default function RequestTripModal({ service, onClose, onCreated }) {
  const [form, setForm] = useState({
    description: '',
    preferred_date: '',
    duration: 7,
    duration_unit: 'days',
    travelers_total: 1,
    travelers_adults: 1,
    travelers_children: 0,
    budget_min: '',
    budget_max: '',
    additional_requirements: '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const create = useRequestTrip();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fieldErr = (k) => {
    const v = errors[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const parsed = serviceTripRequestSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      setBanner('Please fix the highlighted fields.');
      return;
    }

    try {
      const result = await create.mutateAsync({
        serviceUuid: service.uuid,
        payload: parsed.data,
      });
      onCreated?.(result.data);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Request a custom trip</h2>
            <p className="text-xs text-slate-500 mt-0.5">{service.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {banner && <Alert variant="error">{banner}</Alert>}

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe your ideal trip (300–1200 chars)"
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
                Preferred date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={form.preferred_date}
                onChange={set('preferred_date')}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                  errors.preferred_date
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {errors.preferred_date && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErr('preferred_date')}</p>
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
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">Total</label>
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
              Additional requirements
            </label>
            <textarea
              rows={3}
              value={form.additional_requirements}
              onChange={set('additional_requirements')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Send request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
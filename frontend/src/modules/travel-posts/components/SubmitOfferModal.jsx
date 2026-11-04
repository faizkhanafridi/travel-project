import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitOfferSchema, DURATION_UNITS } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSubmitOffer } from '../hooks/useTravelPost';

export default function SubmitOfferModal({ post, offerCost, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    amount: '',
    duration: post.duration || 7,
    duration_unit: post.duration_unit || 'days',
    message: '',
    inclusions: [],
    itinerary: '',
    requirements: [
      { title: '', description: '', answer_type: 'text' },
      { title: '', description: '', answer_type: 'text' },
    ],
  });
  const [inclusionInput, setInclusionInput] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const submit = useSubmitOffer();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fieldErr = (k) => {
    const v = errors[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const addInclusion = () => {
    const v = inclusionInput.trim();
    if (!v || form.inclusions.includes(v)) return;
    setForm((f) => ({ ...f, inclusions: [...f.inclusions, v] }));
    setInclusionInput('');
  };

  const updateReq = (idx, patch) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const addReq = () => {
    if (form.requirements.length >= 20) return;
    setForm((f) => ({
      ...f,
      requirements: [...f.requirements, { title: '', description: '', answer_type: 'text' }],
    }));
  };

  const removeReq = (idx) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.filter((_, i) => i !== idx),
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const parsed = submitOfferSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      setBanner('Please fix the highlighted fields.');
      return;
    }

    try {
      const result = await submit.mutateAsync({
        postUuid: post.uuid,
        payload: parsed.data,
      });
      onSubmitted?.(result.data);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Submit an offer</h2>
            {offerCost > 0 && (
              <p className="text-xs text-amber-700">
                Submitting costs {offerCost} connects
              </p>
            )}
            {offerCost === 0 && (
              <p className="text-xs text-emerald-700">Free (service request)</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submitHandler} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {banner && <Alert variant="error">{banner}</Alert>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Amount (USD) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={set('amount')}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                  errors.amount
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {errors.amount && <p className="mt-1.5 text-xs text-rose-600">{fieldErr('amount')}</p>}
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

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Message to customer <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={set('message')}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                errors.message
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
              placeholder="Introduce yourself and why you're the right choice"
            />
            {errors.message && <p className="mt-1.5 text-xs text-rose-600">{fieldErr('message')}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">What's included</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inclusionInput}
                onChange={(e) => setInclusionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInclusion();
                  }
                }}
                placeholder="e.g. Hotel, tours, transfers"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              <Button type="button" variant="secondary" onClick={addInclusion}>
                Add
              </Button>
            </div>
            {form.inclusions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {form.inclusions.map((i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                  >
                    <span>{i}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          inclusions: f.inclusions.filter((x) => x !== i),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">Itinerary</label>
            <textarea
              rows={3}
              value={form.itinerary}
              onChange={set('itinerary')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">
                Requirements the customer will fill <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={addReq}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add requirement
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              At least 2 requirements. These become the customer's form after they accept your offer.
            </p>

            <div className="space-y-2">
              {form.requirements.map((r, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Requirement #{idx + 1}</p>
                    {form.requirements.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeReq(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => updateReq(idx, { title: e.target.value })}
                    placeholder="Title (e.g. Passport scan)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <textarea
                    rows={2}
                    value={r.description || ''}
                    onChange={(e) => updateReq(idx, { description: e.target.value })}
                    placeholder="Description (optional)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <select
                    value={r.answer_type}
                    onChange={(e) => updateReq(idx, { answer_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="text">Short text</option>
                    <option value="textarea">Long text</option>
                    <option value="file">File upload</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              ))}
            </div>
            {errors.requirements && (
              <p className="mt-1.5 text-xs text-rose-600">{fieldErr('requirements')}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submit.isPending}>
              {offerCost > 0 ? `Submit offer (${offerCost} connects)` : 'Submit offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
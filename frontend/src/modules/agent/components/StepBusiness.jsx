import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import TagInput from './TagInput';
import { businessSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSaveBusiness } from '../hooks/useAgent';

const BUSINESS_TYPES = [
  'Sole Proprietor',
  'Partnership',
  'LLC',
  'Corporation',
  'Travel Agency Franchise',
  'Other',
];

export default function StepBusiness({ agent, onSaved, readOnly }) {
  const [form, setForm] = useState({
    business_description: agent?.business?.business_description || '',
    years_in_business: agent?.business?.years_in_business ?? '',
    business_type: agent?.business?.business_type || '',
    registration_number: agent?.business?.registration_number || '',
    website: agent?.business?.website || '',
    social_media: agent?.business?.social_media || [],
    languages: agent?.business?.languages || [],
    specializations: agent?.business?.specializations || [],
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const save = useSaveBusiness();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    const parsed = businessSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }
    try {
      const result = await save.mutateAsync(parsed.data);
      onSaved?.(result);
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
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Business description <span className="text-rose-600">*</span>
        </label>
        <textarea
          rows={5}
          value={form.business_description}
          onChange={set('business_description')}
          disabled={readOnly}
          placeholder="Describe your agency, services, and expertise (min 50 characters)"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 disabled:bg-slate-50 ${
            errors.business_description
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.business_description ? (
            <p className="text-xs text-rose-600">{fieldErr('business_description')}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-slate-400">
            {form.business_description.length}/5000
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Years in business <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="200"
            value={form.years_in_business}
            onChange={set('years_in_business')}
            disabled={readOnly}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 disabled:bg-slate-50 ${
              errors.years_in_business
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          />
          {errors.years_in_business && (
            <p className="mt-1.5 text-xs text-rose-600">{fieldErr('years_in_business')}</p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Business type <span className="text-rose-600">*</span>
          </label>
          <select
            value={form.business_type}
            onChange={set('business_type')}
            disabled={readOnly}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 disabled:bg-slate-50 ${
              errors.business_type
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          >
            <option value="">Select type…</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.business_type && (
            <p className="mt-1.5 text-xs text-rose-600">{fieldErr('business_type')}</p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Registration number
          </label>
          <input
            type="text"
            value={form.registration_number}
            onChange={set('registration_number')}
            disabled={readOnly}
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={set('website')}
            disabled={readOnly}
            placeholder="https://example.com"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 disabled:bg-slate-50 ${
              errors.website
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          />
          {errors.website && (
            <p className="mt-1.5 text-xs text-rose-600">{fieldErr('website')}</p>
          )}
        </div>
      </div>

      <TagInput
        label="Social media links"
        value={form.social_media}
        onChange={(v) => setForm((f) => ({ ...f, social_media: v }))}
        placeholder="https://facebook.com/yourpage"
        error={fieldErr('social_media')}
      />

      <TagInput
        label="Languages"
        value={form.languages}
        onChange={(v) => setForm((f) => ({ ...f, languages: v }))}
        placeholder="English"
                error={fieldErr('languages')}
      />

      <TagInput
        label="Specializations"
        value={form.specializations}
        onChange={(v) => setForm((f) => ({ ...f, specializations: v }))}
        placeholder="Umrah, Honeymoon, Adventure"
        error={fieldErr('specializations')}
      />

      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" loading={save.isPending}>
            Save & continue
          </Button>
        </div>
      )}
    </form>
  );
}
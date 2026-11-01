import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { agencySchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSaveAgency } from '../hooks/useAgent';

const FIELDS = [
  { key: 'agency_name', label: 'Agency name', placeholder: 'ABC Travels' },
  { key: 'agency_owner_name', label: 'Agency owner name', placeholder: 'Ahmed Khan' },
  { key: 'agency_phone', label: 'Phone', placeholder: '+92 300 1234567', optional: true },
  { key: 'agency_country', label: 'Country', placeholder: 'Pakistan' },
  { key: 'agency_city', label: 'City', placeholder: 'Karachi' },
  { key: 'agency_address', label: 'Address', placeholder: 'Full street address', full: true },
];

export default function StepAgency({ agent, onSaved, readOnly }) {
  const [form, setForm] = useState({
    agency_name: agent?.agency?.agency_name || '',
    agency_owner_name: agent?.agency?.agency_owner_name || '',
    agency_phone: agent?.agency?.agency_phone || '',
    agency_country: agent?.agency?.agency_country || '',
    agency_city: agent?.agency?.agency_city || '',
    agency_address: agent?.agency?.agency_address || '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const save = useSaveAgency();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const parsed = agencySchema.safeParse(form);
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

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}
      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              {f.label} {!f.optional && <span className="text-rose-600">*</span>}
            </label>
            <input
              type="text"
              value={form[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              disabled={readOnly}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                errors[f.key]
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              } disabled:bg-slate-50 disabled:text-slate-500`}
            />
            {errors[f.key] && (
              <p className="mt-1.5 text-xs text-rose-600">
                {Array.isArray(errors[f.key]) ? errors[f.key][0] : errors[f.key]}
              </p>
            )}
          </div>
        ))}
      </div>
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
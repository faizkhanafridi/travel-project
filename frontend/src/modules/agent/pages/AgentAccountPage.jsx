import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import DocumentLink from '../components/DocumentLink';
import HoursEditor, { DAYS } from '../components/HoursEditor';
import TagInput from '../components/TagInput';
import Button from '../../../components/ui/Button';
import { agencySchema, businessSchema, hoursSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import {
  useAgentAccount,
  useUpdateAgency,
  useUpdateBusiness,
  useUpdateHours,
} from '../hooks/useAgent';

const TABS = [
  { key: 'agency', label: 'Agency' },
  { key: 'business', label: 'Business' },
  { key: 'documents', label: 'Documents' },
  { key: 'hours', label: 'Hours' },
];

const BUSINESS_TYPES = [
  'Sole Proprietor',
  'Partnership',
  'LLC',
  'Corporation',
  'Travel Agency Franchise',
  'Other',
];

export default function AgentAccountPage() {
  const { data, isLoading, error } = useAgentAccount();
  const [tab, setTab] = useState('agency');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Loading agency…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Alert variant="error">
            Only approved agents can access this page.
          </Alert>
        </div>
      </div>
    );
  }

  const agent = data?.data;
  const agency = agent?.agency || {};
  const business = agent?.business || {};
  const docs = agent?.documents?.data || agent?.documents || [];
  const hours = agent?.business_hours?.data || agent?.business_hours || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Agency account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your approved agency information. Documents are view-only.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                tab === t.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          {tab === 'agency' && (
            <AgencySection initial={agency} />
          )}
          {tab === 'business' && (
            <BusinessSection initial={business} />
          )}
          {tab === 'documents' && (
            <div>
              <p className="text-sm text-slate-500 mb-3">
                Documents are view-only after approval.
              </p>
              {docs.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {docs.map((d) => (
                    <DocumentLink key={d.uuid} doc={d} />
                  ))}
                </ul>
              )}
            </div>
          )}
          {tab === 'hours' && <HoursSection initial={hours} />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Agency ---------------- */

function AgencySection({ initial }) {
  const [form, setForm] = useState({
    agency_name: initial?.agency_name || '',
    agency_owner_name: initial?.agency_owner_name || '',
    agency_phone: initial?.agency_phone || '',
    agency_country: initial?.agency_country || '',
    agency_city: initial?.agency_city || '',
    agency_address: initial?.agency_address || '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [saved, setSaved] = useState(false);
  const save = useUpdateAgency();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    setSaved(false);
    const parsed = agencySchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }
    try {
      await save.mutateAsync(parsed.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  const FIELDS = [
    { key: 'agency_name', label: 'Agency name' },
    { key: 'agency_owner_name', label: 'Owner name' },
    { key: 'agency_phone', label: 'Phone', optional: true },
    { key: 'agency_country', label: 'Country' },
    { key: 'agency_city', label: 'City' },
    { key: 'agency_address', label: 'Address', full: true },
  ];

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}
      {saved && <Alert variant="success">Agency information saved.</Alert>}

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
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                errors[f.key]
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
            {errors[f.key] && (
              <p className="mt-1.5 text-xs text-rose-600">
                {Array.isArray(errors[f.key]) ? errors[f.key][0] : errors[f.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={save.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Business ---------------- */

function BusinessSection({ initial }) {
  const [form, setForm] = useState({
    business_description: initial?.business_description || '',
    years_in_business: initial?.years_in_business ?? '',
    business_type: initial?.business_type || '',
    registration_number: initial?.registration_number || '',
    website: initial?.website || '',
    social_media: initial?.social_media || [],
    languages: initial?.languages || [],
    specializations: initial?.specializations || [],
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [saved, setSaved] = useState(false);
  const save = useUpdateBusiness();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fieldErr = (k) => {
    const v = errors[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    setSaved(false);
    const parsed = businessSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }
    try {
      await save.mutateAsync(parsed.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}
      {saved && <Alert variant="success">Business information saved.</Alert>}

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Business description <span className="text-rose-600">*</span>
        </label>
        <textarea
          rows={5}
          value={form.business_description}
          onChange={set('business_description')}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
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
          <p className="text-xs text-slate-400">{form.business_description.length}/5000</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Years in business <span className="text-rose-600">*</span>
          </label>          <input
            type="number"
            min="0"
            max="200"
            value={form.years_in_business}
            onChange={set('years_in_business')}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
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
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
              errors.business_type
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          >
            <option value="">Select type…</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
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
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={set('website')}
            placeholder="https://example.com"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
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

      <div className="flex justify-end">
        <Button type="submit" loading={save.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Hours ---------------- */

function HoursSection({ initial }) {
  const initialRows = (() => {
    const map = new Map();
    (initial || []).forEach((h) => map.set(h.day_of_week, h));
    return Array.from({ length: 7 }, (_, i) => {
      const existing = map.get(i);
      return {
        day_of_week: i,
        is_closed: existing?.is_closed ?? (i === 0),
        open_time: existing?.open_time || '09:00',
        close_time: existing?.close_time || '18:00',
      };
    });
  })();

  const [hours, setHours] = useState(initialRows);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [saved, setSaved] = useState(false);
  const save = useUpdateHours();

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    setSaved(false);

    const payload = {
      hours: hours.map((h) => ({
        day_of_week: h.day_of_week,
        is_closed: h.is_closed,
        open_time: h.is_closed ? null : h.open_time || null,
        close_time: h.is_closed ? null : h.close_time || null,
      })),
    };

    const parsed = hoursSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) {
        const idx = issue.path[1];
        if (idx !== undefined) {
          fe[idx] = fe[idx] || {};
          fe[idx][issue.path[2] || '_'] = issue.message;
        }
      }
      setErrors(fe);
      return;
    }

    try {
      await save.mutateAsync(parsed.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}
      {saved && <Alert variant="success">Business hours saved.</Alert>}

      <HoursEditor hours={hours} onChange={setHours} errors={errors} />

      <div className="flex justify-end">
        <Button type="submit" loading={save.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
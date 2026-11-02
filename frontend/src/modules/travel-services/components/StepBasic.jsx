import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { basicSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useCategories } from '../hooks/useService';

export default function StepBasic({ service, onSaved }) {
  const { data: catRes, isLoading: catLoading } = useCategories();
  const categories = catRes?.data || [];

  const [form, setForm] = useState({
    title: service?.title || '',
    category_id: service?.category_id || '',
    subcategory_id: service?.subcategory_id || '',
    tags: service?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectedCat = categories.find((c) => c.id === Number(form.category_id));
  const subs = selectedCat?.subcategories || [];

  const addTag = () => {
    const v = tagInput.trim();
    if (!v || form.tags.includes(v) || form.tags.length >= 20) return;
    setForm((f) => ({ ...f, tags: [...f.tags, v] }));
    setTagInput('');
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

    const parsed = basicSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }

    setSaving(true);
    try {
      const { useSaveBasic } = await import('../hooks/useService');
      const { serviceService } = await import('../services/serviceService');
      const result = await serviceService.saveBasic(service.uuid, parsed.data);
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Title <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="7-Day Malaysia Family Vacation"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
            errors.title
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        />
        {errors.title && <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p>}
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
            disabled={catLoading}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
              errors.category_id
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1.5 text-xs text-rose-600">{errors.category_id}</p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Subcategory <span className="text-rose-600">*</span>
          </label>
          <select
            value={form.subcategory_id}
            onChange={(e) => setForm((f) => ({ ...f, subcategory_id: e.target.value }))}
            disabled={!selectedCat}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
              errors.subcategory_id
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          >
            <option value="">Select subcategory…</option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.subcategory_id && (
            <p className="mt-1.5 text-xs text-rose-600">{errors.subcategory_id}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Tags <span className="text-rose-600">*</span>
          <span className="text-xs font-normal text-slate-500 ml-1">
            (at least 3)
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="e.g. Dubai, family, honeymoon"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
              >
                {t}
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))
                  }
                  className="text-brand-700 hover:text-brand-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="mt-1.5 text-xs text-rose-600">
            {Array.isArray(errors.tags) ? errors.tags[0] : errors.tags}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          Save & continue
        </Button>
      </div>
    </form>
  );
}
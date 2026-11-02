import { useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import ExtraEditor from "./ExtraEditor";
import { detailsSchema, DURATION_UNITS } from "../schemas";
import { extractErrors, firstGeneral } from "../../../lib/errors";
import { serviceService } from "../services/serviceService";

export default function StepDetails({ service, onSaved }) {
  const [form, setForm] = useState({
    short_description: service?.short_description || "",
    full_description: service?.full_description || "",
    price: service?.price || "",
    destination_country: service?.destination_country || "",
    destination_city: service?.destination_city || "",
    duration: service?.duration || 1,
    duration_unit: service?.duration_unit || "days",
    inclusions: service?.inclusions || [],
    extras: service?.extras || [],
    cancellation_policy: service?.cancellation_policy || "",
  });
  const [inclusionInput, setInclusionInput] = useState("");
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addInclusion = () => {
    const v = inclusionInput.trim();
    if (!v || form.inclusions.includes(v) || form.inclusions.length >= 30)
      return;
    setForm((f) => ({ ...f, inclusions: [...f.inclusions, v] }));
    setInclusionInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const parsed = detailsSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      setBanner(
        "Please fix the highlighted fields: " +
          Object.keys(fe)
            .map((k) => k.replace(/_/g, " "))
            .join(", "),
      );
      return;
    }

    setSaving(true);
    try {
      const result = await serviceService.saveDetails(
        service.uuid,
        parsed.data,
      );
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      const general = firstGeneral(errs);
      setBanner(
        general || errs.message?.[0] || "Could not save. Please try again.",
      );
    } finally {
      setSaving(false);
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
          Short description
        </label>
        <input
          type="text"
          value={form.short_description}
          onChange={set("short_description")}
          placeholder="One-line summary (optional)"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Full description <span className="text-rose-600">*</span>
        </label>
        <textarea
          rows={6}
          value={form.full_description}
          onChange={set("full_description")}
          placeholder="Describe what's included and what makes this special (600–2000 chars)"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
            errors.full_description
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
              : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
          }`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.full_description ? (
            <p className="text-xs text-rose-600">
              {fieldErr("full_description")}
            </p>
          ) : (
            <span />
          )}
          <p className="text-xs text-slate-400">
            {form.full_description.length}/2000
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Price (USD) <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={set("price")}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
              errors.price
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
            }`}
          />
          {errors.price && (
            <p className="mt-1.5 text-xs text-rose-600">{fieldErr("price")}</p>
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
              onChange={set("duration")}
              className={`w-24 rounded-xl border bg-white px-3 py-3 text-sm focus:outline-none focus:ring-4 ${
                errors.duration
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
              }`}
            />
            <select
              value={form.duration_unit}
              onChange={set("duration_unit")}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              {DURATION_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          {errors.duration_unit && (
            <p className="mt-1.5 text-xs text-rose-600">
              {fieldErr("duration_unit")}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Destination country <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.destination_country}
            onChange={set("destination_country")}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
              errors.destination_country
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
            }`}
          />
          {errors.destination_country && (
            <p className="mt-1.5 text-xs text-rose-600">
              {fieldErr("destination_country")}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            Destination city <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.destination_city}
            onChange={set("destination_city")}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
              errors.destination_city
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
            }`}
          />
          {errors.destination_city && (
            <p className="mt-1.5 text-xs text-rose-600">
              {fieldErr("destination_city")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          What's included <span className="text-rose-600">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inclusionInput}
            onChange={(e) => setInclusionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInclusion();
              }
            }}
            placeholder="e.g. Airport transfers"
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
        {errors.inclusions && (
          <p className="mt-1.5 text-xs text-rose-600">
            {Array.isArray(errors.inclusions)
              ? errors.inclusions[0]
              : errors.inclusions}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Optional paid extras
        </label>
        <ExtraEditor
          value={form.extras}
          onChange={(v) => setForm((f) => ({ ...f, extras: v }))}
        />
        {errors.extras && (
          <p className="mt-1.5 text-xs text-rose-600">
            {Array.isArray(errors.extras) ? errors.extras[0] : errors.extras}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700">
          Cancellation policy
        </label>
        <textarea
          rows={3}
          value={form.cancellation_policy}
          onChange={set("cancellation_policy")}
          placeholder="Optional"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        {errors.cancellation_policy && (
          <p className="mt-1.5 text-xs text-rose-600">
            {fieldErr("cancellation_policy")}
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

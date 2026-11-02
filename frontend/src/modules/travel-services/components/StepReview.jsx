import { useState } from 'react';
import { AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSubmitService } from '../hooks/useService';
import { useCategories } from '../hooks/useService';
import { useCurrencyConverter } from '../hooks/useService';

export default function StepReview({ service, onSubmitted }) {
  const [banner, setBanner] = useState(null);
  const submit = useSubmitService(service.uuid);

  const steps = service?.steps || {};
  const ready = steps.basic && steps.details && steps.gallery && steps.requirements;
const { data: catRes } = useCategories();
const categories = catRes?.data || [];

const category = categories.find((c) => c.id === Number(service.category_id));
const subcategory = category?.subcategories?.find(
  (s) => s.id === Number(service.subcategory_id)
);
  const onSubmit = async () => {
    setBanner(null);
    try {
      const result = await submit.mutateAsync();
      onSubmitted?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };
const { format } = useCurrencyConverter();

  return (
    <div className="space-y-6">
      {banner && <Alert variant="error">{banner}</Alert>}

      {!ready && (
        <Alert variant="info">
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            All previous steps must be saved before submitting.
          </span>
        </Alert>
      )}

      <Section title="Gallery">
        {(service.images || []).length === 0 ? (
          <p className="text-sm text-slate-500">No images uploaded.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {service.images.map((img) => (
              <div
                key={img.uuid}
                className="relative rounded-lg overflow-hidden border border-slate-200"
              >
                <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                {img.is_cover && (
                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Basic">
        <Row label="Title" value={service.title} />
        <Row label="Category" value={category?.name} />
<Row label="Subcategory" value={subcategory?.name} />
        
      </Section>

      <Section title="Details">
        <Row label="Full description" value={service.full_description} multiline />
        {/* <Row label="Price" value={`USD ${Number(service.price).toLocaleString()}`} /> */}
        <Row label="Price" value={format(service.price)} />

        <Row label="Destination" value={`${service.destination_city}, ${service.destination_country}`} />
        <Row label="Duration" value={`${service.duration} ${service.duration_unit}`} />
        <Row label="Inclusions" value={(service.inclusions || []).join(', ')} />
        {service.extras?.length > 0 && (
          <Row
            label="Extras"
            value={service.extras
              .map((e) => `${e.label} (USD ${Number(e.price).toFixed(2)})`)
              .join(', ')}
          />
        )}
        {service.cancellation_policy && (
          <Row label="Cancellation" value={service.cancellation_policy} multiline />
        )}
        <Row label="Tags" value={(service.tags || []).join(', ')} />
      </Section>

      <Section title="Requirements">
        {(service.requirements || []).length === 0 ? (
          <p className="text-sm text-slate-500">No requirements defined.</p>
        ) : (
          <ul className="space-y-2">
            {service.requirements.map((r) => (
              <li
                key={r.uuid}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {String(r.answer_type).replace('_', ' ')}
                  {r.description ? ` · ${r.description}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onSubmit}
          loading={submit.isPending}
          disabled={!ready}
          size="lg"
        >
          Submit for review
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, multiline }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={multiline ? '' : 'flex items-center gap-3'}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`text-sm text-slate-800 ${multiline ? 'mt-1 whitespace-pre-line' : ''}`}>
        {value}
      </p>
    </div>
  );
}
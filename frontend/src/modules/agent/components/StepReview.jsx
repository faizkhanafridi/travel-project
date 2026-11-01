import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import DocumentLink from './DocumentLink';
import { DAYS } from './HoursEditor';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSubmitAgent } from '../hooks/useAgent';

export default function StepReview({ agent, onSubmitted }) {
  const [banner, setBanner] = useState(null);
  const submit = useSubmitAgent();

  const steps = agent?.steps || {};
  const ready = steps.agency && steps.business && steps.documents && steps.hours;

  const onFinalSubmit = async () => {
    setBanner(null);
    try {
      const result = await submit.mutateAsync();
      onSubmitted?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };

  const agency = agent?.agency || {};
  const business = agent?.business || {};
  const docs = agent?.documents?.data || agent?.documents || [];
  const hours = agent?.business_hours?.data || agent?.business_hours || [];

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

      <Section title="Agency information">
        <Row label="Agency name" value={agency.agency_name} />
        <Row label="Owner name" value={agency.agency_owner_name} />
        <Row label="Phone" value={agency.agency_phone} />
        <Row label="Country" value={agency.agency_country} />
        <Row label="City" value={agency.agency_city} />
        <Row label="Address" value={agency.agency_address} />
      </Section>

      <Section title="Business information">
        <Row label="Description" value={business.business_description} multiline />
        <Row label="Years in business" value={business.years_in_business} />
        <Row label="Business type" value={business.business_type} />
        <Row label="Registration #" value={business.registration_number} />
        <Row label="Website" value={business.website} />
        <Row label="Social media" value={(business.social_media || []).join(', ')} />
        <Row label="Languages" value={(business.languages || []).join(', ')} />
        <Row label="Specializations" value={(business.specializations || []).join(', ')} />
      </Section>

      <Section title="Documents">
        {docs.length === 0 ? (
          <p className="text-sm text-slate-500">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <DocumentLink key={d.uuid || d.type} doc={d} />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Business hours">
        <div className="grid sm:grid-cols-2 gap-2">
          {hours
            .slice()
            .sort((a, b) => a.day_of_week - b.day_of_week)
            .map((h) => {
              const day = DAYS.find((d) => d.value === h.day_of_week);
              return (
                <div
                  key={h.day_of_week}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-700">{day?.label}</span>
                  <span className={h.is_closed ? 'text-slate-400' : 'text-slate-800'}>
                    {h.is_closed ? 'Closed' : `${h.open_time} – ${h.close_time}`}
                  </span>
                </div>
              );
            })}
        </div>
      </Section>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          onClick={onFinalSubmit}
          loading={submit.isPending}
          disabled={!ready}
          size="lg"
        >
          Submit application
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
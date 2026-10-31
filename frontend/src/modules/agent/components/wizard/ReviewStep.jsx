import { Calendar, Globe, Languages as LangIcon, MapPin, Phone, User } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-ink-900 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 border-b border-ink-100 last:border-b-0">
      <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-ink-800">{children || '—'}</span>
    </div>
  );
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ReviewStep({ application }) {
  const profile = application?.profile || {};
  const documents = application?.documents || [];
  const hours = application?.business_hours || [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-600">
        Please review everything below. Use <strong>Back</strong> if you need to
        correct anything, or submit when ready.
      </p>

      <Section title="Agency information">
        <Row label="Agency name">{profile.agency_name}</Row>
        <Row label="Owner name">{profile.agency_owner_name}</Row>
        <Row label="Phone">{profile.phone}</Row>
        <Row label="Country">{profile.country}</Row>
        <Row label="City">{profile.city}</Row>
        <Row label="Address">{profile.address}</Row>
      </Section>

      <Section title="Business information">
        <Row label="Description">
          <span className="whitespace-pre-line">
            {profile.business_description}
          </span>
        </Row>
        <Row label="Years">{profile.years_in_business}</Row>
        <Row label="Type">{profile.business_type}</Row>
        <Row label="Registration">{profile.registration_information}</Row>
        <Row label="Website">
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <Globe size={14} /> {profile.website}
            </a>
          )}
        </Row>
        <Row label="Social">{profile.social_media?.join(', ')}</Row>
        <Row label="Languages">{profile.languages?.join(', ')}</Row>
        <Row label="Specializations">
          {profile.specializations?.join(', ')}
        </Row>
      </Section>

      <Section title="Documents">
        {documents.length === 0 ? (
          <p className="text-sm text-ink-500">No documents uploaded.</p>
        ) : (
          <ul className="space-y-1.5">
            {documents.map((d) => (
              <li
                key={d.uuid}
                className="flex items-center justify-between text-sm text-ink-800"
              >
                <span className="capitalize">
                  {d.type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-ink-500">
                  {d.original_name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Business hours">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {hours.map((h) => (
            <div
              key={h.day_of_week}
              className="flex items-center justify-between text-sm text-ink-800"
            >
              <span>{DAY_LABELS[h.day_of_week]}</span>
              <span className="text-ink-600">
                {h.is_closed
                  ? 'Closed'
                  : `${h.open_time} – ${h.close_time}`}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
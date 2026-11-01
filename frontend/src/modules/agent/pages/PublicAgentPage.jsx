import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import { usePublicAgent } from '../hooks/useAgent';
import { DAYS } from '../components/HoursEditor';

// Agency public profile — uses GET /api/agent/public/{uuid}
// Shows agency info only. Never renders owner email, phone, or documents.
export default function PublicAgentPage() {
  const { uuid } = useParams();
  const { data, isLoading, error } = usePublicAgent(uuid);
  const agent = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-40 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">This agency is not available.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, #fff 0, transparent 40%), radial-gradient(circle at 85% 80%, #fff 0, transparent 45%)',
            }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  {agent.agency_name || 'Travel Agency'}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
              {agent.agency_owner_name && (
                <p className="text-white/80 text-sm mt-1">
                  Owned by {agent.agency_owner_name}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-3">
                {(agent.agency_city || agent.agency_country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[agent.agency_city, agent.agency_country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
                {agent.years_in_business !== null &&
                  agent.years_in_business !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {agent.years_in_business} yr
                      {agent.years_in_business === 1 ? '' : 's'} in business
                    </span>
                  )}
                {agent.business_type && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {agent.business_type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 mt-6">
          {agent.business_description && (
            <Section title="About the agency">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {agent.business_description}
              </p>
            </Section>
          )}

          {agent.agency_address && (
            <Section title="Address">
              <p className="text-sm text-slate-700 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <span>
                  {agent.agency_address}
                  {(agent.agency_city || agent.agency_country) && (
                    <>
                      <br />
                      {[agent.agency_city, agent.agency_country]
                        .filter(Boolean)
                        .join(', ')}
                    </>
                  )}
                </span>
              </p>
            </Section>
          )}

          {agent.website && (
            <Section title="Website">
              <a
                href={agent.website}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800 break-all"
              >
                {agent.website}
              </a>
            </Section>
          )}

          {agent.social_media && agent.social_media.length > 0 && (
            <Section title="Social media">
              <ul className="space-y-2">
                {agent.social_media.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800 break-all"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {agent.languages && agent.languages.length > 0 && (
            <Section title="Languages">
              <div className="flex flex-wrap gap-2">
                {agent.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {agent.specializations && agent.specializations.length > 0 && (
            <Section title="Specializations">
              <div className="flex flex-wrap gap-2">
                {agent.specializations.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {agent.business_hours && agent.business_hours.length > 0 && (
            <Section title="Business hours">
              <div className="grid sm:grid-cols-2 gap-2">
                {agent.business_hours
                  .slice()
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((h) => {
                    const day = DAYS.find((d) => d.value === h.day_of_week);
                    return (
                      <div
                        key={h.day_of_week}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-slate-700">
                          {day?.label}
                        </span>
                        <span
                          className={
                            h.is_closed
                              ? 'text-slate-400 inline-flex items-center gap-1'
                              : 'text-slate-800 inline-flex items-center gap-1'
                          }
                        >
                          {h.is_closed ? (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              Closed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              {h.open_time} – {h.close_time}
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Section>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}
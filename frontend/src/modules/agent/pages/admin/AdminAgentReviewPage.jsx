import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import Navbar from '../../../../components/layout/Navbar';
import Alert from '../../../../components/ui/Alert';
import Button from '../../../../components/ui/Button';
import FullPageLoader from '../../../../components/ui/FullPageLoader';
import DocumentLink from '../../components/DocumentLink';
import { useAdminAgent, useAdminAgentAction } from '../../hooks/useAgent';
import { rejectReasonSchema } from '../../schemas';
import { extractErrors, firstGeneral } from '../../../../lib/errors';
import { DAYS } from '../../components/HoursEditor';

export default function AdminAgentReviewPage() {
  const { uuid } = useParams();
  const { data, isLoading, error, refetch } = useAdminAgent(uuid);
  const action = useAdminAgentAction();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectErr, setRejectErr] = useState(null);
  const [banner, setBanner] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const agent = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Loading application…" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Alert variant="error">Application not found.</Alert>
          <Link
            to="/admin/agents"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </Link>
        </div>
      </div>
    );
  }

  const canDecide = ['PENDING_REVIEW', 'UNDER_REVIEW'].includes(agent.status);

  const runAction = async (type, reason) => {
    setBanner(null);
    setPendingAction(type);
    try {
      await action.mutateAsync({ action: type, uuid: agent.uuid, reason });
      await refetch();
      setRejectOpen(false);
      setRejectReason('');
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    } finally {
      setPendingAction(null);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    setRejectErr(null);
    const parsed = rejectReasonSchema.safeParse({ reason: rejectReason });
    if (!parsed.success) {
      setRejectErr(parsed.error.issues[0].message);
      return;
    }
    await runAction('reject', parsed.data.reason);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin/agents"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>

        <div className="mt-4 mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {agent.agency?.agency_name || 'Agent application'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Attempt #{agent.attempt} · Submitted{' '}
              {agent.submitted_at
                ? new Date(agent.submitted_at).toLocaleString()
                : '—'}
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
            {String(agent.status).replace('_', ' ')}
          </span>
        </div>

        {banner && <Alert variant="error">{banner}</Alert>}

        {canDecide && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => runAction('under_review')}
              loading={pendingAction === 'under_review'}
              disabled={pendingAction !== null && pendingAction !== 'under_review'}
            >
              Mark under review
            </Button>
            <Button
              type="button"
              onClick={() => runAction('approve')}
              loading={pendingAction === 'approve'}
              disabled={pendingAction !== null && pendingAction !== 'approve'}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setRejectOpen(true)}
              disabled={pendingAction !== null}
            >
              Reject
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <Section title="Owner">
            <Row label="Name" value={agent.user?.name} />
            <Row label="Username" value={agent.user?.username} />
            <Row label="Email" value={agent.user?.email} />
          </Section>

          <Section title="Agency">
            <Row label="Agency name" value={agent.agency?.agency_name} />
            <Row label="Owner name" value={agent.agency?.agency_owner_name} />
            <Row label="Phone" value={agent.agency?.agency_phone} />
            <Row label="Country" value={agent.agency?.agency_country} />
            <Row label="City" value={agent.agency?.agency_city} />
            <Row label="Address" value={agent.agency?.agency_address} />
          </Section>

          <Section title="Business">
            <Row
              label="Description"
              value={agent.business?.business_description}
              multiline
            />
            <Row label="Years in business" value={agent.business?.years_in_business} />
            <Row label="Type" value={agent.business?.business_type} />
            <Row label="Registration #" value={agent.business?.registration_number} />
            <Row label="Website" value={agent.business?.website} />
            <Row
              label="Social media"
              value={(agent.business?.social_media || []).join(', ')}
            />
            <Row
              label="Languages"
              value={(agent.business?.languages || []).join(', ')}
            />
            <Row
              label="Specializations"
              value={(agent.business?.specializations || []).join(', ')}
            />
          </Section>

          <Section title="Documents">
            {(agent.documents || []).length === 0 ? (
              <p className="text-sm text-slate-500">No documents.</p>
            ) : (
              <ul className="space-y-2">
                {(agent.documents || []).map((d) => (
                  <DocumentLink key={d.uuid} doc={d} />
                ))}
              </ul>
            )}
          </Section>

          <Section title="Business hours">
            {(agent.business_hours || []).length === 0 ? (
              <p className="text-sm text-slate-500">No hours configured.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {(agent.business_hours || [])
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
                            h.is_closed ? 'text-slate-400' : 'text-slate-800'
                          }
                        >
                          {h.is_closed
                            ? 'Closed'
                            : `${h.open_time} – ${h.close_time}`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </Section>

          {agent.history && agent.history.length > 0 && (
            <Section title="Submission history">
              <ul className="space-y-2">
                {agent.history.map((h, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 capitalize">
                        Attempt #{h.attempt} ·{' '}
                        {String(h.action).replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {h.created_at
                          ? new Date(h.created_at).toLocaleString()
                          : '—'}
                      </p>
                      {h.reason && (
                        <p className="text-xs text-rose-700 mt-1 whitespace-pre-line">
                          {h.reason}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </main>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Reject submission #{agent.attempt}
              </h2>
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setRejectErr(null);
                  setRejectReason('');
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitReject} className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Explain what the agent needs to fix.
              </p>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Example: please re-upload a valid business license."
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                    rejectErr
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {rejectErr ? (
                    <p className="text-xs text-rose-600">{rejectErr}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-slate-400">
                    {rejectReason.length}/2000
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setRejectOpen(false);
                    setRejectErr(null);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={pendingAction === 'reject'}
                >
                  Reject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      <p
        className={`text-sm text-slate-800 ${
          multiline ? 'mt-1 whitespace-pre-line' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
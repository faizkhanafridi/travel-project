import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Download,
  Eye,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldOff,
  Clock,
} from "lucide-react";
import { useAdminAgent } from "../../hooks/admin/useAdminAgent";
import { useAdminAgentAction } from "../../hooks/admin/useAdminAgentAction";
import AgentStatusBadge from "../../components/admin/AgentStatusBadge";
import AdminRejectModal from "../../components/admin/AdminRejectModal";
import AdminSuspendModal from "../../components/admin/AdminSuspendModal";
import Button from "../../../../shared/components/Button";
import { DOCUMENT_LABELS } from "../../schemas/agentSchemas";
import DocumentPreviewModal from "../../components/admin/DocumentPreviewModal";
import {
  downloadAgentDocument,
  viewAgentDocument,
} from "../../hooks/admin/useAdminDocumentDownload";
const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-ink-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-1.5 border-b border-ink-100 last:border-b-0">
      <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-ink-800 break-words">
        {children || "—"}
      </span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function AdminAgentDetailPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const query = useAdminAgent(uuid);
  const action = useAdminAgentAction();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const agent = query.data?.data;

  if (query.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-ink-500">
        Loading application…
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h1 className="text-xl font-bold text-ink-900">
          Application not found
        </h1>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/admin/agents")}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const profile = agent.profile || {};
  const documents = agent.documents || [];
  const hours = agent.business_hours || [];
  const latest = agent.latest_attempt;

  const status = agent.status;
  const canReview = status === "pending_review" || status === "under_review";
  const canSuspend = status === "approved";
  const canUnsuspend = status === "suspended";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/agents")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-ink-900 mb-2"
          >
            <ArrowLeft size={12} /> All applications
          </button>
          <h1 className="text-2xl font-bold text-ink-900">
            {profile.agency_name || "Untitled agency"}
          </h1>
          <p className="text-sm text-ink-600">
            Owner: {profile.agency_owner_name || agent.owner?.email}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-600">
            <AgentStatusBadge status={status} />
            <span>·</span>
            <span>
              Attempt #{latest?.attempt_number ?? agent.current_attempt}
            </span>
            <span>·</span>
            <span>
              Submitted {formatDate(latest?.submitted_at || agent.submitted_at)}
            </span>
          </div>
        </div>
      </div>

      {latest?.rejection_reason && status === "rejected" && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-semibold text-ink-900">
            Rejection reason (Attempt #{latest.attempt_number})
          </p>
          <p className="mt-1 text-sm text-ink-700 whitespace-pre-line">
            {latest.rejection_reason}
          </p>
        </div>
      )}

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
              className="text-primary hover:underline"
            >
              {profile.website}
            </a>
          )}
        </Row>
        <Row label="Social">{profile.social_media?.join(", ")}</Row>
        <Row label="Languages">{profile.languages?.join(", ")}</Row>
        <Row label="Specializations">{profile.specializations?.join(", ")}</Row>
      </Section>

      <Section title="Documents">
        {documents.length === 0 ? (
          <p className="text-sm text-ink-500">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li
                key={d.uuid}
                className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2 gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">
                    {DOCUMENT_LABELS[d.type] || d.type}
                  </p>
                  <p className="text-xs text-ink-500 truncate">
                    {d.original_name} · {(d.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => viewAgentDocument(agent.uuid, d.uuid)}
                  >
                    <Eye size={14} /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      downloadAgentDocument(agent.uuid, d.uuid, d.original_name)
                    }
                  >
                    <Download size={14} /> Download
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Business hours">
        {hours.length === 0 ? (
          <p className="text-sm text-ink-500">No hours configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {hours.map((h) => (
              <div
                key={h.day_of_week}
                className="flex items-center justify-between text-sm text-ink-800"
              >
                <span>{DAY_LABELS[h.day_of_week]}</span>
                <span className="text-ink-600">
                  {h.is_closed ? "Closed" : `${h.open_time} – ${h.close_time}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {agent.events?.length > 0 && (
        <Section title="History">
          <ul className="space-y-2">
            {agent.events.map((ev) => (
              <li
                key={ev.uuid}
                className="flex items-start justify-between gap-3 rounded-lg border border-ink-200 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink-900 capitalize">
                    {ev.event.replace("_", " ")}
                  </p>
                  {ev.note && (
                    <p className="text-xs text-ink-600 mt-0.5 whitespace-pre-line">
                      {ev.note}
                    </p>
                  )}
                </div>
                <span className="text-xs text-ink-500 shrink-0">
                  {formatDate(ev.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Actions */}
      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {canReview && status === "pending_review" && (
            <Button
              variant="outline"
              onClick={() =>
                action.mutate({ uuid: agent.uuid, action: "under-review" })
              }
              loading={
                action.isPending && action.variables?.action === "under-review"
              }
            >
              <Clock size={14} /> Mark under review
            </Button>
          )}

          {canReview && (
            <>
              <Button
                variant="primary"
                onClick={() =>
                  action.mutate({ uuid: agent.uuid, action: "approve" })
                }
                loading={
                  action.isPending && action.variables?.action === "approve"
                }
              >
                <CheckCircle2 size={14} /> Approve
              </Button>
              <Button variant="danger" onClick={() => setRejectOpen(true)}>
                <XCircle size={14} /> Reject
              </Button>
            </>
          )}

          {canSuspend && (
            <Button variant="danger" onClick={() => setSuspendOpen(true)}>
              <ShieldOff size={14} /> Suspend
            </Button>
          )}

          {canUnsuspend && (
            <Button
              variant="primary"
              onClick={() =>
                action.mutate({ uuid: agent.uuid, action: "unsuspend" })
              }
              loading={
                action.isPending && action.variables?.action === "unsuspend"
              }
            >
              Unsuspend
            </Button>
          )}

          {!canReview && !canSuspend && !canUnsuspend && (
            <p className="text-sm text-ink-500">
              No actions available for this status.
            </p>
          )}
        </div>
      </div>

      <AdminRejectModal
        open={rejectOpen}
        attempt={latest?.attempt_number}
        loading={action.isPending && action.variables?.action === "reject"}
        onClose={() => setRejectOpen(false)}
        onSubmit={async (reason) => {
          await action.mutateAsync({
            uuid: agent.uuid,
            action: "reject",
            reason,
          });
          setRejectOpen(false);
        }}
      />

      <AdminSuspendModal
        open={suspendOpen}
        loading={action.isPending && action.variables?.action === "suspend"}
        onClose={() => setSuspendOpen(false)}
        onSubmit={async (reason) => {
          await action.mutateAsync({
            uuid: agent.uuid,
            action: "suspend",
            reason,
          });
          setSuspendOpen(false);
        }}
      />
      <DocumentPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        agentUuid={agent.uuid}
        doc={previewDoc}
        onDownload={() =>
          previewDoc &&
          downloadAgentDocument(
            agent.uuid,
            previewDoc.uuid,
            previewDoc.original_name,
          )
        }
      />
    </div>
  );
}

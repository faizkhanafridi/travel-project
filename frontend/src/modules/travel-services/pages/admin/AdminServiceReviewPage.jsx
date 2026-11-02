import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import Navbar from "../../../../components/layout/Navbar";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import FullPageLoader from "../../../../components/ui/FullPageLoader";
import { useAdminService, useAdminServiceAction } from "../../hooks/useService";
import { rejectReasonSchema } from "../../schemas";
import { extractErrors, firstGeneral } from "../../../../lib/errors";
import { useCurrencyConverter } from "../../hooks/useService";
export default function AdminServiceReviewPage() {
  const { uuid } = useParams();
  const { data, isLoading, error, refetch } = useAdminService(uuid);
  const action = useAdminServiceAction(uuid);
  const [pendingAction, setPendingAction] = useState(null);
  const [banner, setBanner] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState("service");
  const [republishUuid, setRepublishUuid] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectErr, setRejectErr] = useState(null);
  const { format } = useCurrencyConverter();

  const service = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Loading service…" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Alert variant="error">Service not found.</Alert>
          <Link
            to="/admin/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </Link>
        </div>
      </div>
    );
  }

  const runAction = async (actionType, reason, rpUuid) => {
    if (
      actionType === "approve_republish" ||
      actionType === "reject_republish"
    ) {
      if (!rpUuid) {
        setBanner("Republish request is missing its ID. Please refresh.");
        return;
      }
    }
    setBanner(null);
    setPendingAction(actionType);
    try {
      await action.mutateAsync({
        action: actionType,
        reason,
        republishUuid: rpUuid,
      });
      await refetch();
      setRejectOpen(false);
      setRejectReason("");
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
    if (rejectTarget === "republish") {
      await runAction("reject_republish", parsed.data.reason, republishUuid);
    } else {
      await runAction("reject", parsed.data.reason);
    }
  };

  const openRejectService = () => {
    setRejectTarget("service");
    setRepublishUuid(null);
    setRejectReason("");
    setRejectErr(null);
    setRejectOpen(true);
  };

  const openRejectRepublish = (rpUuid) => {
    setRejectTarget("republish");
    setRepublishUuid(rpUuid);
    setRejectReason("");
    setRejectErr(null);
    setRejectOpen(true);
  };

  const isPending = ["PENDING_REVIEW", "UNDER_REVIEW"].includes(service.status);
  const isPublished = service.status === "PUBLISHED";
  const isUnpublished = service.status === "UNPUBLISHED";
  const isSuspended = service.status === "SUSPENDED";
  const pendingRepublish =
    service.latest_republish_request?.status === "PENDING"
      ? service.latest_republish_request
      : null;

  const cover = service.images?.find((i) => i.is_cover) || service.images?.[0];
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin/services"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to services
        </Link>

        <div className="mt-4 mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {service.title}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {service.agent?.agency_name || "Agent"} ·{" "}
              {service.category?.name || service.category}
              {service.subcategory?.name || service.subcategory
                ? ` · ${service.subcategory?.name || service.subcategory}`
                : ""}
            </p>
            {service.attempt > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Submission #{service.attempt}
              </p>
            )}
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
            {String(service.status).replace("_", " ")}
          </span>
        </div>

        {banner && <Alert variant="error">{banner}</Alert>}

        {/* Decision bar */}
        {isPending && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => runAction("under_review")}
              loading={pendingAction === "under_review"}
              disabled={
                pendingAction !== null && pendingAction !== "under_review"
              }
            >
              Mark under review
            </Button>
            <Button
              type="button"
              onClick={() => runAction("approve")}
              loading={pendingAction === "approve"}
              disabled={pendingAction !== null && pendingAction !== "approve"}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={openRejectService}
              disabled={pendingAction !== null}
            >
              Reject
            </Button>
          </div>
        )}

        {isPublished && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => runAction("unpublish")}
              loading={pendingAction === "unpublish"}
              disabled={pendingAction !== null && pendingAction !== "unpublish"}
            >
              Unpublish
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => runAction("suspend")}
              loading={pendingAction === "suspend"}
              disabled={pendingAction !== null && pendingAction !== "suspend"}
            >
              Suspend
            </Button>
          </div>
        )}

        {isUnpublished && pendingRepublish && pendingRepublish.uuid && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              Pending republish request
            </p>
            <p className="text-sm text-amber-800 mb-3 whitespace-pre-line">
              {pendingRepublish.reason}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() =>
                  runAction("approve_republish", null, pendingRepublish.uuid)
                }
                loading={pendingAction === "approve_republish"}
                disabled={
                  pendingAction !== null &&
                  pendingAction !== "approve_republish"
                }
              >
                Approve republish
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => openRejectRepublish(pendingRepublish.uuid)}
                disabled={pendingAction !== null}
              >
                Reject republish
              </Button>
            </div>
          </div>
        )}

        {isUnpublished && !pendingRepublish && (
          <Alert variant="info">
            This service is unpublished. The agent can request a republish from
            their services list.
          </Alert>
        )}

        {isSuspended && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => runAction("unsuspend")}
              loading={pendingAction === "unsuspend"}
              disabled={pendingAction !== null && pendingAction !== "unsuspend"}
            >
              Unsuspend
            </Button>
            <p className="text-xs text-slate-500 mt-2">
              Unsuspending restores the service to Unpublished. You must
              republish it separately.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {cover && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10]">
              <img
                src={cover.url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Section title="Basic">
            <Row label="Title" value={service.title} />
            <Row
              label="Category"
              value={service.category?.name || service.category}
            />
            <Row
              label="Subcategory"
              value={service.subcategory?.name || service.subcategory}
            />
            <Row label="Tags" value={(service.tags || []).join(", ")} />
          </Section>

          <Section title="Details">
            <Row
              label="Full description"
              value={service.full_description}
              multiline
            />
            <Row label="Price" value={format(service.price)} />{" "}
            <Row
              label="Destination"
              value={`${service.destination_city}, ${service.destination_country}`}
            />
            <Row
              label="Duration"
              value={`${service.duration} ${service.duration_unit}`}
            />
            <Row
              label="Inclusions"
              value={(service.inclusions || []).join(", ")}
            />
            {service.extras?.length > 0 && (
              <Row
                label="Extras"
                value={service.extras
                  .map((e) => `${e.label} (${format(e.price)})`)
                  .join(", ")}
              />
            )}
            {service.cancellation_policy && (
              <Row
                label="Cancellation"
                value={service.cancellation_policy}
                multiline
              />
            )}
          </Section>

          <Section title="Gallery">
            {(service.images || []).length === 0 ? (
              <p className="text-sm text-slate-500">No images.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {service.images.map((img) => (
                  <div
                    key={img.uuid}
                    className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
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

          <Section title="Requirements">
            {(service.requirements || []).length === 0 ? (
              <p className="text-sm text-slate-500">No requirements.</p>
            ) : (
              <ul className="space-y-2">
                {service.requirements.map((r) => (
                  <li
                    key={r.uuid}
                    className="rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {r.title}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {String(r.answer_type).replace("_", " ")}
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {service.history && service.history.length > 0 && (
            <Section title="Submission history">
              <ul className="space-y-2">
                {service.history.map((h, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 capitalize">
                        {h.attempt ? `Attempt #${h.attempt} · ` : ""}
                        {String(h.action).replace("_", " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {h.created_at
                          ? new Date(h.created_at).toLocaleString()
                          : "—"}
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
                {rejectTarget === "republish"
                  ? "Reject republish request"
                  : `Reject submission #${service.attempt}`}
              </h2>
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setRejectErr(null);
                  setRejectReason("");
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitReject} className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                {rejectTarget === "republish"
                  ? "Explain why this republish request is being rejected."
                  : "Explain what the agent needs to fix."}
              </p>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain the reason…"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                    rejectErr
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
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
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={
                    rejectTarget === "republish"
                      ? pendingAction === "reject_republish"
                      : pendingAction === "reject"
                  }
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
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={multiline ? "" : "flex items-center gap-3"}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`text-sm text-slate-800 ${multiline ? "mt-1 whitespace-pre-line" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

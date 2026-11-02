import { AlertCircle, CheckCircle2, Clock, XCircle, ShieldAlert, FileWarning } from 'lucide-react';

const MAP = {
  DRAFT: { icon: Clock, tone: 'bg-slate-50 border-slate-200 text-slate-700', title: 'Draft', body: 'Complete all steps and submit for review.' },
  PENDING_REVIEW: { icon: Clock, tone: 'bg-amber-50 border-amber-200 text-amber-800', title: 'Pending review', body: 'Your service is under review. We will notify you once a decision is made.' },
  UNDER_REVIEW: { icon: AlertCircle, tone: 'bg-sky-50 border-sky-200 text-sky-800', title: 'Under review', body: 'An admin is currently reviewing your service.' },
  PUBLISHED: { icon: CheckCircle2, tone: 'bg-emerald-50 border-emerald-200 text-emerald-800', title: 'Published', body: 'Your service is live in the marketplace.' },
  REJECTED: { icon: XCircle, tone: 'bg-rose-50 border-rose-200 text-rose-800', title: 'Rejected', body: 'Fix the issues below and resubmit.' },
  UNPUBLISHED: { icon: FileWarning, tone: 'bg-amber-50 border-amber-200 text-amber-800', title: 'Unpublished', body: 'This service is hidden from the marketplace. You can request a republish from the services list.' },
  SUSPENDED: { icon: ShieldAlert, tone: 'bg-rose-50 border-rose-200 text-rose-800', title: 'Suspended', body: 'This service is suspended. Contact support.' },
};

export default function ServiceStatusBanner({ status, attempt, rejectionReason, republishRequest }) {
  if (!status) return null;
  const meta = MAP[status] || MAP.DRAFT;
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border px-5 py-4 ${meta.tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{meta.title}</p>
            {attempt > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70">
                Attempt #{attempt}
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5 leading-relaxed">{meta.body}</p>
          {status === 'REJECTED' && rejectionReason && (
            <div className="mt-3 rounded-lg bg-white/70 border border-rose-200 px-3 py-2">
              <p className="text-xs font-semibold text-rose-800 mb-0.5">Rejection reason</p>
              <p className="text-sm text-rose-800 whitespace-pre-line">{rejectionReason}</p>
            </div>
          )}
          {status === 'UNPUBLISHED' && republishRequest && (
            <div className="mt-3 rounded-lg bg-white/70 border border-amber-200 px-3 py-2 text-sm">
              {republishRequest.status === 'PENDING' && (
                <p className="text-amber-800">
                  A republish request is pending admin review.
                </p>
              )}
              {republishRequest.status === 'REJECTED' && (
                <>
                  <p className="text-xs font-semibold text-rose-800">
                    Previous republish request rejected
                  </p>
                  <p className="text-rose-800 whitespace-pre-line">
                    {republishRequest.rejection_reason}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
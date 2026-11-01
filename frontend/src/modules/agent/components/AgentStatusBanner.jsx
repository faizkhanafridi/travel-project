import { AlertCircle, CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';

const STATUS_MAP = {
  DRAFT: {
    icon: Clock,
    tone: 'bg-slate-50 border-slate-200 text-slate-700',
    title: 'Draft application',
    body: 'Complete all steps and submit for review.',
  },
  PENDING_REVIEW: {
    icon: Clock,
    tone: 'bg-amber-50 border-amber-200 text-amber-800',
    title: 'Application submitted',
    body: 'Your application is now under review. We will notify you once an admin has reviewed it.',
  },
  UNDER_REVIEW: {
    icon: AlertCircle,
    tone: 'bg-sky-50 border-sky-200 text-sky-800',
    title: 'Under review',
    body: 'An admin is currently reviewing your application.',
  },
  APPROVED: {
    icon: CheckCircle2,
    tone: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    title: 'Application approved',
    body: 'You are now an approved agent.',
  },
  REJECTED: {
    icon: XCircle,
    tone: 'bg-rose-50 border-rose-200 text-rose-800',
    title: 'Application rejected',
    body: 'Fix the issues below and resubmit.',
  },
  SUSPENDED: {
    icon: ShieldAlert,
    tone: 'bg-rose-50 border-rose-200 text-rose-800',
    title: 'Account suspended',
    body: 'Contact support for assistance.',
  },
};

export default function AgentStatusBanner({ status, attempt, rejectionReason }) {
  if (!status) return null;
  const meta = STATUS_MAP[status] || STATUS_MAP.DRAFT;
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border px-5 py-4 ${meta.tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{meta.title}</p>
            {attempt > 1 && (
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
        </div>
      </div>
    </div>
  );
}
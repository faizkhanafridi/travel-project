import { cn } from '../../../shared/lib/utils';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldOff } from 'lucide-react';

const config = {
  draft: { icon: Clock, tone: 'bg-ink-100 text-ink-700', label: 'Draft' },
  pending_review: {
    icon: Clock,
    tone: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    label: 'Pending review',
  },
  under_review: {
    icon: Clock,
    tone: 'bg-blue-50 text-blue-800 border-blue-200',
    label: 'Under review',
  },
  rejected: {
    icon: XCircle,
    tone: 'bg-danger/5 text-danger border-danger/30',
    label: 'Rejected',
  },
  approved: {
    icon: CheckCircle2,
    tone: 'bg-success/5 text-success border-success/30',
    label: 'Approved',
  },
  suspended: {
    icon: ShieldOff,
    tone: 'bg-ink-100 text-ink-700 border-ink-300',
    label: 'Suspended',
  },
};

export default function StatusBanner({ status, children }) {
  const c = config[status] || config.draft;
  const Icon = c.icon;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3',
        c.tone
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold">{c.label}</p>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}
import { cn } from '../../../../shared/lib/utils';

const tones = {
  draft: 'bg-ink-100 text-ink-700',
  pending_review: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  rejected: 'bg-danger/10 text-danger',
  approved: 'bg-success/10 text-success',
  suspended: 'bg-ink-200 text-ink-700',
};

export default function AgentStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        tones[status] || tones.draft
      )}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}
import { AlertTriangle } from 'lucide-react';

export default function RejectionNotice({ attempt, reason }) {
  if (!reason) return null;
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-danger mt-0.5" />
        <div>
          <p className="font-semibold text-ink-900">
            Application rejected
            {attempt ? ` — Attempt ${attempt}` : ''}
          </p>
          <p className="mt-1 text-sm text-ink-700 whitespace-pre-line">
            {reason}
          </p>
          <p className="mt-2 text-xs text-ink-500">
            Fix the issues below and resubmit. Your previous data is preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
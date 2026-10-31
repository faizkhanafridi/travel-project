import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import { useSubmitApplication } from '../../hooks/useSubmitApplication';

export default function SubmitStep({ application, onSubmitted }) {
  const navigate = useNavigate();
  const submit = useSubmitApplication();
  const status = application?.status;

  const onSubmit = async () => {
    const res = await submit.mutateAsync().catch(() => null);
    if (res) onSubmitted?.(res.data);
  };

  // Already pending / under review — show "under review" card
  if (status === 'pending_review' || status === 'under_review') {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-yellow-800 mt-0.5" />
          <div>
            <h3 className="font-semibold text-ink-900">
              Application submitted
            </h3>
            <p className="mt-1 text-sm text-ink-700">
              Your application is now under review. We&apos;ll notify you once
              an admin has reviewed it.
            </p>
            <p className="mt-2 text-xs font-semibold text-yellow-800">
              Pending Review · Attempt #{application?.current_attempt}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  // Approved
  if (status === 'approved') {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-success mt-0.5" />
          <div>
            <h3 className="font-semibold text-ink-900">
              You&apos;re approved!
            </h3>
            <p className="mt-1 text-sm text-ink-700">
              Your agent account is active. You can now create travel services.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => navigate('/agent')}>
            Go to agent dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Rejected — allow resubmission
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-600">
        Everything is ready. Click below to submit your application for admin
        review.
      </p>

      <div className="rounded-xl border border-ink-200 bg-white p-4">
        <p className="text-sm text-ink-700">
          By submitting you confirm all information is accurate and documents
          are valid. Submissions are reviewed by our team — this usually takes
          1–2 business days.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={onSubmit}
          loading={submit.isPending}
        >
          {status === 'rejected' ? (
            <>
              <RefreshCw size={14} /> Fix & resubmit
            </>
          ) : (
            'Submit application'
          )}
        </Button>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyApplication } from '../hooks/useMyApplication';
import { useStartApplication } from '../hooks/useStartApplication';
import WizardStepper from '../components/wizard/WizardStepper';
import AgencyStep from '../components/wizard/AgencyStep';
import BusinessStep from '../components/wizard/BusinessStep';
import DocumentsStep from '../components/wizard/DocumentsStep';
import BusinessHoursStep from '../components/wizard/BusinessHoursStep';
import ReviewStep from '../components/wizard/ReviewStep';
import SubmitStep from '../components/wizard/SubmitStep';
import StatusBanner from '../components/StatusBanner';
import RejectionNotice from '../components/RejectionNotice';
import ProfileSkeleton from '../../profile/components/ProfileSkeleton';
import Button from '../../../shared/components/Button';
import useAuthStore from '../../../shared/stores/authStore';

const STEP_KEYS = ['agency', 'business', 'documents', 'hours', 'review', 'submit'];

export default function AgentApplicationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const query = useMyApplication();
  const start = useStartApplication();
  const [step, setStep] = useState('agency');

  const app = query.data?.data || null;
  const status = app?.status;
  const locked = status && ['pending_review', 'under_review', 'approved', 'suspended'].includes(status);
  const isDraftOrRejected = !status || status === 'draft' || status === 'rejected';

  // Determine first incomplete step on load
  useEffect(() => {
    if (!app) return;
    const profile = app.profile || {};
    if (!profile.agency_information_completed) return setStep('agency');
    if (!profile.business_information_completed) return setStep('business');
    const hasRequiredDocs = ['business_registration', 'license', 'identity'].every(
      (t) => (app.documents || []).some((d) => d.type === t)
    );
    if (!hasRequiredDocs) return setStep('documents');
    if ((app.business_hours || []).length < 7) return setStep('hours');
    setStep('review');
  }, [app]);

  const gotoNext = () => {
    const idx = STEP_KEYS.indexOf(step);
    if (idx >= 0 && idx < STEP_KEYS.length - 1) {
      setStep(STEP_KEYS[idx + 1]);
    }
  };
  const gotoPrev = () => {
    const idx = STEP_KEYS.indexOf(step);
    if (idx > 0) setStep(STEP_KEYS[idx - 1]);
  };

  const handleStart = async () => {
    const res = await start.mutateAsync().catch(() => null);
    if (res) setStep('agency');
  };

  // Not logged in? Guards cover this, but a defensive check is safe.
  if (!user) {
    return null;
  }

  if (query.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  // No application yet → prompt to start
  if (!app) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
          <h1 className="text-2xl font-bold text-ink-900">Become an Agent</h1>
          <p className="mt-2 text-sm text-ink-600">
            Apply to offer travel services on Voyago. You&apos;ll need to
            provide agency information, business details, documents, and
            business hours. Applications are reviewed by our team.
          </p>
          <div className="mt-5 flex justify-end">
            <Button onClick={handleStart} loading={start.isPending}>
              Start application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const latestAttempt =
    app.latest_attempt ||
    (app.attempts?.length
      ? [...app.attempts].sort((a, b) => b.attempt_number - a.attempt_number)[0]
      : null);

  const rejectionReason =
    status === 'rejected' ? latestAttempt?.rejection_reason : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Agent Application</h1>
          <p className="text-sm text-ink-600 mt-0.5">
            Attempt #{app.current_attempt} ·{' '}
            <span className="capitalize">{status?.replace('_', ' ')}</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </div>

      <div className="mb-5">
        <StatusBanner status={status}>
          {status === 'pending_review' && (
            <p>
              Your application is under review. You&apos;ll be notified once an
              admin has reviewed it.
            </p>
          )}
          {status === 'under_review' && (
            <p>An admin is reviewing your application right now.</p>
          )}
          {status === 'approved' && (
            <p>Your agent account is active. You can now create services.</p>
          )}
          {status === 'suspended' && (
            <p>Your agent account is suspended. Please contact support.</p>
          )}
        </StatusBanner>
      </div>

      {rejectionReason && (
        <div className="mb-5">
          <RejectionNotice
            attempt={latestAttempt?.attempt_number}
            reason={rejectionReason}
          />
        </div>
      )}

      {!locked && <WizardStepper current={step} />}

      <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
        {locked ? (
          <SubmitStep application={app} onSubmitted={(data) => {
            // Cache updated by hook; navigate away or stay to show status
          }} />
        ) : (
          <>
            {step === 'agency' && (
              <AgencyStep
                initial={app.profile}
                disabled={!isDraftOrRejected}
                onSaved={gotoNext}
              />
            )}
            {step === 'business' && (
              <BusinessStep
                initial={app.profile}
                disabled={!isDraftOrRejected}
                onSaved={gotoNext}
              />
            )}
            {step === 'documents' && (
              <DocumentsStep
                documents={app.documents}
                disabled={!isDraftOrRejected}
              />
            )}
            {step === 'hours' && (
              <BusinessHoursStep
                initial={app.business_hours}
                disabled={!isDraftOrRejected}
                onSaved={gotoNext}
              />
            )}
            {step === 'review' && (
              <div className="space-y-4">
                <ReviewStep application={app} />
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={gotoPrev}>
                    Back
                  </Button>
                  <Button onClick={() => setStep('submit')}>
                    Continue to submit
                  </Button>
                </div>
              </div>
            )}
            {step === 'submit' && (
              <div className="space-y-4">
                <SubmitStep
                  application={app}
                  onSubmitted={() => {
                    // Stay to show pending card
                  }}
                />
                <div className="flex justify-start">
                  <Button variant="ghost" onClick={gotoPrev}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Documents step needs a manual "continue" button */}
            {step === 'documents' && isDraftOrRejected && (
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={gotoPrev}>
                  Back
                </Button>
                <Button onClick={gotoNext}>Continue</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
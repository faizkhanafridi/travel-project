import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import WizardStepper from '../components/WizardStepper';
import AgentStatusBanner from '../components/AgentStatusBanner';
import StepAgency from '../components/StepAgency';
import StepBusiness from '../components/StepBusiness';
import StepDocuments from '../components/StepDocuments';
import StepHours from '../components/StepHours';
import StepReview from '../components/StepReview';
import { useAgentWizard } from '../hooks/useAgent';

const STEP_ORDER = ['agency', 'business', 'documents', 'hours', 'review'];

export default function AgentApplicationPage() {
  const { data, isLoading, error, refetch } = useAgentWizard();
  const [step, setStep] = useState(0);

  const agent = data?.data;
  const status = agent?.status;
  const steps = agent?.steps || {};

  useEffect(() => {
    if (!agent) return;
    if (status === 'DRAFT' || status === 'REJECTED') {
      const firstUnsaved = STEP_ORDER.findIndex((k) => !steps[k]);
      if (firstUnsaved >= 0) setStep(firstUnsaved);
      else setStep(STEP_ORDER.length - 1);
    }
  }, [agent?.uuid, status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Loading application…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Alert variant="error">Could not load agent application.</Alert>
        </div>
      </div>
    );
  }

  // Approved agents go to the account editor, not the wizard.
  if (status === 'APPROVED') {
    window.location.replace('/agent/account');
    return null;
  }

  const isLocked = ['PENDING_REVIEW', 'UNDER_REVIEW', 'SUSPENDED'].includes(status);
  const stepKey = STEP_ORDER[step];

  const handleSaved = async () => {
    const refreshed = await refetch();
    const newSteps = refreshed.data?.data?.steps || {};
    const currentKey = STEP_ORDER[step];
    // Only advance if the current step's flag is now true
    if (newSteps[currentKey] && step < STEP_ORDER.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Agent application
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete each step and save to continue.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <AgentStatusBanner
            status={status}
            attempt={agent?.attempt || 0}
            rejectionReason={agent?.rejection_reason}
          />
        </div>

        {isLocked ? (
          <Alert variant="info">
            Your application is locked while under review. You will be notified once a
            decision is made.
          </Alert>
        ) : (
          <>
            <div className="mb-6">
              <WizardStepper current={step} savedFlags={steps} onNavigate={setStep} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              {stepKey === 'agency' && (
                <StepAgency agent={agent} onSaved={handleSaved} />
              )}
              {stepKey === 'business' && (
                <StepBusiness agent={agent} onSaved={handleSaved} />
              )}
              {stepKey === 'documents' && (
                <StepDocuments agent={agent} onSaved={handleSaved} />
              )}
              {stepKey === 'hours' && (
                <StepHours agent={agent} onSaved={handleSaved} />
              )}
              {stepKey === 'review' && (
                <StepReview agent={agent} onSubmitted={refetch} />
              )}
            </div>

            {step > 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={back}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  ← Back
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
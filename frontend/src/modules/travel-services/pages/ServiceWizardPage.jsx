import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import ServiceWizardStepper from '../components/ServiceWizardStepper';
import ServiceStatusBanner from '../components/ServiceStatusBanner';
import StepBasic from '../components/StepBasic';
import StepDetails from '../components/StepDetails';
import StepGallery from '../components/StepGallery';
import StepRequirements from '../components/StepRequirements';
import StepReview from '../components/StepReview';
import { useService } from '../hooks/useService';
import { useAuthStore } from '../../../stores/authStore';

const ORDER = ['basic', 'details', 'gallery', 'requirements', 'review'];

export default function ServiceWizardPage() {
  const { uuid } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch } = useService(uuid);
  const [step, setStep] = useState(0);

  const service = data?.data;
  const steps = service?.steps || {};
  const status = service?.status;

  if (user?.is_super_admin) return <Navigate to="/admin/services" replace />;

  useEffect(() => {
    if (!service) return;
    if (['DRAFT', 'REJECTED'].includes(status)) {
      const first = ORDER.findIndex((k) => !steps[k]);
      setStep(first >= 0 ? first : ORDER.length - 1);
    }
  }, [service?.uuid, status]); // eslint-disable-line react-hooks/exhaustive-deps

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
        </div>
      </div>
    );
  }

  if (status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Alert variant="error">This service is suspended and unavailable.</Alert>
        </div>
      </div>
    );
  }

  const isLocked = ['PENDING_REVIEW', 'UNDER_REVIEW'].includes(status);
  const stepKey = ORDER[step];

  const handleSaved = async () => {
    const refreshed = await refetch();
    const newSteps = refreshed.data?.data?.steps || {};
    if (newSteps[ORDER[step]] && step < ORDER.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleSubmitted = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/services/mine"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to my services
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            {service.title || 'New service'}
          </h1>
        </div>

        <div className="mb-6">
          <ServiceStatusBanner
            status={status}
            attempt={service.attempt}
            rejectionReason={service.rejection_reason}
            republishRequest={service.latest_republish_request}
          />
        </div>

        {isLocked ? (
          <Alert variant="info">
            Your service is locked while under review.
          </Alert>
        ) : (
          <>
            <div className="mb-6">
              <ServiceWizardStepper
                current={step}
                savedFlags={steps}
                onNavigate={setStep}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              {stepKey === 'basic' && <StepBasic service={service} onSaved={handleSaved} />}
              {stepKey === 'details' && <StepDetails service={service} onSaved={handleSaved} />}
              {stepKey === 'gallery' && <StepGallery service={service} onSaved={handleSaved} />}
              {stepKey === 'requirements' && (
                <StepRequirements service={service} onSaved={handleSaved} />
              )}
              {stepKey === 'review' && (
                <StepReview service={service} onSubmitted={handleSubmitted} />
              )}
            </div>

            {step > 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
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
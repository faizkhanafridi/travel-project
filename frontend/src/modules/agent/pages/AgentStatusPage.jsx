import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useMyApplication } from '../hooks/useMyApplication';
import Button from '../../../shared/components/Button';
import ProfileSkeleton from '../../profile/components/ProfileSkeleton';

export default function AgentStatusPage() {
  const navigate = useNavigate();
  const query = useMyApplication();
  const app = query.data?.data;

  if (query.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-ink-900">
          You&apos;re not an agent yet
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          Apply to become an agent to start offering travel services.
        </p>
        <Button className="mt-6" onClick={() => navigate('/become-agent')}>
          Become an Agent
        </Button>
      </div>
    );
  }

  const status = app.status;

  if (status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <CheckCircle2 size={40} className="mx-auto text-success" />
        <h1 className="mt-4 text-2xl font-bold text-ink-900">
          Agent dashboard
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          Full agent dashboard (services, bookings, reviews) arrives in a later
          module.
        </p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </div>
    );
  }

  const Icon = status === 'rejected' ? XCircle : Clock;
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <Icon
        size={40}
        className={`mx-auto ${
          status === 'rejected' ? 'text-danger' : 'text-yellow-600'
        }`}
      />
      <h1 className="mt-4 text-2xl font-bold text-ink-900 capitalize">
        {status.replace('_', ' ')}
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        {status === 'rejected'
          ? 'Please review the feedback and resubmit.'
          : 'Your application is being reviewed.'}
      </p>
      <Button className="mt-6" onClick={() => navigate('/become-agent')}>
        {status === 'rejected' ? 'Fix & resubmit' : 'View application'}
      </Button>
    </div>
  );
}
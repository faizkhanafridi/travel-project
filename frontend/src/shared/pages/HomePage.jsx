import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Button from '../components/Button';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const isApprovedAgent = user?.roles?.includes('agent');
  const isOnboarded = user?.onboarding_completed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-ink-900">
        Welcome{user ? ', explorer' : ''} 👋
      </h1>
      <p className="mt-3 text-ink-600">
        The marketplace, services, and dashboards will land here as we build each
        module.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {!isOnboarded && (
          <Link to="/onboarding/choose-role">
            <Button>Complete onboarding</Button>
          </Link>
        )}

        {!isApprovedAgent && (
          <Link to="/become-agent">
            <Button variant="outline">Become an Agent</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
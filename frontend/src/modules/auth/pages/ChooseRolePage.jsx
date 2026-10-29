import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import RoleCard from '../components/RoleCard';
import Button from '../../../shared/components/Button';
import { useChooseRole } from '../hooks/useChooseRole';
import Logo from '../../../shared/components/Logo';
import useAuthStore from '../../../shared/stores/authStore';

export default function ChooseRolePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('customer');
  const { mutateAsync, isPending } = useChooseRole();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    AOS.refresh();
  }, []);

  // If already onboarded, don't show this page again.
  useEffect(() => {
    if (user?.onboarding_completed) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async () => {
    const res = await mutateAsync({ account_type: selected }).catch(() => null);
    if (res?.data) {
      // Both roles go to profile setup (Module 02 placeholder).
      navigate('/profile-setup', { replace: true, state: { role: selected } });
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8" data-aos="fade-down">
        <Logo size="lg" />
      </div>
      <div
        className="w-full max-w-[560px] rounded-xl2 bg-white border border-ink-200 shadow-card p-6 sm:p-8"
        data-aos="fade-up"
      >
        <h1 className="text-2xl font-bold text-ink-900">How do you want to use Voyago?</h1>
        <p className="mt-1.5 text-sm text-ink-600">
          You can start as a customer and become an agent later.
        </p>

        <div className="mt-6 space-y-3">
          <RoleCard
            value="customer"
            selected={selected === 'customer'}
            onSelect={setSelected}
            title="Customer"
            description="Browse and book trips from trusted agents."
          />
          <RoleCard
            value="agent"
            selected={selected === 'agent'}
            onSelect={setSelected}
            title="Agent"
            description="Offer travel services and grow your business."
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <Button
            size="lg"
            loading={isPending}
            onClick={onSubmit}
            className="sm:flex-1"
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/')}
            className="sm:flex-1"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
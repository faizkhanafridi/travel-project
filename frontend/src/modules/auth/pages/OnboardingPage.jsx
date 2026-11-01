import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../stores/authStore';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(null); // 'customer' | 'agent' | 'skip'
  const [error, setError] = useState(null);

  const choose = async (choice) => {
    setSubmitting(choice);
    setError(null);
    try {
      const result = await authService.chooseRole({ choice });
      setUser(result.data);
      navigate('/profile-setup', { replace: true });
    } catch (err) {
      const errs = extractErrors(err);
      setError(firstGeneral(errs));
    } finally {
      setSubmitting(null);
    }
  };

  const skip = async () => {
    setSubmitting('skip');
    setError(null);
    try {
      const result = await authService.skipOnboarding();
      setUser(result.data);
      navigate('/', { replace: true });
    } catch (err) {
      const errs = extractErrors(err);
      setError(firstGeneral(errs));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <AuthLayout
      title="How will you use Travel Marketplace?"
      subtitle="You can always switch or become an agent later."
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <RoleCard
          icon={User}
          title="I'm a traveler"
          description="Browse, book trips, and post travel requests to get offers from verified agents."
          onClick={() => choose('customer')}
          loading={submitting === 'customer'}
          disabled={!!submitting}
        />
        <RoleCard
          icon={Briefcase}
          title="I'm a travel agent"
          description="Sell travel services, send offers to travel posts, and grow your agency."
          onClick={() => choose('agent')}
          loading={submitting === 'agent'}
          disabled={!!submitting}
          accent
        />

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={skip}
            disabled={!!submitting}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
          >
            {submitting === 'skip' ? 'Skipping…' : 'Skip for now'}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

function RoleCard({ icon: Icon, title, description, onClick, loading, disabled, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border p-5 transition-all group ${
        accent
          ? 'border-brand-200 bg-gradient-to-br from-brand-50 to-white hover:border-brand-400 hover:shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
            accent ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {loading ? (
              <span className="text-xs text-slate-400">Saving…</span>
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}
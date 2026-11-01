import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { forgotPasswordSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(parsed.data);
      // Backend returns { message, flow: 'reset' | 'set' | 'unknown' }
      const flow = res?.flow || 'reset';
      if (flow === 'set') {
        navigate(
          `/set-password?email=${encodeURIComponent(email)}&social=1`,
          { replace: true }
        );
      } else {
        // 'reset' or 'unknown' → default to reset page (safe, no enumeration leak)
        navigate(
          `/reset-password?email=${encodeURIComponent(email)}`,
          { replace: true }
        );
      }
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      // Cooldown 422 = code already sent earlier. Still route the user forward,
      // defaulting to reset page (we cannot know the flow at this point).
      if (err?.response?.status === 422 && /wait before requesting/i.test(msg)) {
        navigate(
          `/reset-password?email=${encodeURIComponent(email)}`,
          { replace: true }
        );
        return;
      }
      const errs = extractErrors(err);
      setFieldError(errs.email?.[0] || null);
      setError(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset code."
      footer={
        <p className="text-sm text-center text-slate-500">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          {fieldError && <p className="mt-1.5 text-xs text-rose-600">{fieldError}</p>}
        </div>
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Send reset code
        </Button>
      </form>
    </AuthLayout>
  );
}
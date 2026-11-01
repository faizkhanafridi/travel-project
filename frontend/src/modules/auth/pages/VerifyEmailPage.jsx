import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../stores/authStore';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function VerifyEmailPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const emailParam = search.get('email') || '';
  const codeParam = search.get('code') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(codeParam);
  const [error, setError] = useState(null);
  const [codeError, setCodeError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Auto-submit if the email link included both email and code.
  useEffect(() => {
    if (emailParam && codeParam && !autoSubmitted.current) {
      autoSubmitted.current = true;
      doVerify(emailParam, codeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doVerify = async (emailToUse, codeToUse) => {
    setError(null);
    setCodeError(null);
    if (!/^\d{6}$/.test(codeToUse)) {
      setCodeError('Enter the 6-digit code');
      return;
    }
    setSubmitting(true);
    try {
      const result = await authService.verifyEmail({ email: emailToUse, code: codeToUse });
      const user = result.data;
      setUser(user);
      if (!user.onboarding_completed) navigate('/onboarding', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      const apiErrors = extractErrors(err);
      setCodeError(apiErrors.code?.[0] || null);
      setError(firstGeneral(apiErrors));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    doVerify(email, code);
  };

  const resend = async () => {
    setError(null);
    setResendMsg(null);
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    setResending(true);
    try {
      await authService.resendVerification({ email });
      setResendMsg('If a pending registration exists, a new code has been sent.');
      setCooldown(60);
    } catch (err) {
      const apiErrors = extractErrors(err);
      setError(firstGeneral(apiErrors));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email || 'your email'}.`}
      footer={
        <p className="text-sm text-center text-slate-500">
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Start over
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-brand-700" />
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {resendMsg && <Alert variant="info">{resendMsg}</Alert>}

        {!emailParam && (
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        )}

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 text-center">
            Verification code
          </label>
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={submitting}
            error={codeError}
          />
        </div>

        <Button type="submit" loading={submitting} size="lg" className="w-full">
          Verify & continue
        </Button>

        <div className="text-center text-sm text-slate-500">
          Didn't get the code?{' '}
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldown > 0}
            className="font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
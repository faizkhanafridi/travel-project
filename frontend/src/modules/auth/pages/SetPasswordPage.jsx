import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import PasswordInput from '../components/PasswordInput';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { setPasswordSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSocial = searchParams.get('social') === '1';

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    code: searchParams.get('code') || '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const codeFilled = /^\d{6}$/.test(form.code);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    const parsed = setPasswordSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }
    setLoading(true);
    try {
      await authService.setPassword(parsed.data);
      setDone(true);
      setTimeout(() => {
        sessionStorage.removeItem('social_setpw_sent');
        if (isSocial) navigate('/onboarding', { replace: true });
        else navigate('/login', { replace: true });
      }, 1200);

    console.log('[set-password] POST →', '/auth/set-password', form);

    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setBanner(null);
    setResendMsg(null);
    if (!form.email) {
      setBanner('Enter your email first.');
      return;
    }
    setResending(true);
    try {
      await authService.forgotPassword({ email: form.email });
      setResendMsg('If an account exists for this email, a new code has been sent.');
      setCooldown(60);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Set your password"
      subtitle="Add a password to sign in without a social account."
      footer={
        <p className="text-sm text-center text-slate-500">
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to sign in
          </Link>
        </p>
      }
    >
      {done ? (
        <Alert variant="success">
          Password set successfully. Redirecting…
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {banner && <Alert variant="error">{banner}</Alert>}

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
            {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 text-center">
              Verification code
            </label>
            <OtpInput
              value={form.code}
              onChange={(v) => setForm((f) => ({ ...f, code: v }))}
              disabled={loading}
              error={errors.code?.[0]}
            />
          </div>

          {resendMsg && <Alert variant="info">{resendMsg}</Alert>}
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

          {codeFilled && (
            <>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Password
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Minimum 8 characters"
                  error={errors.password?.[0]}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={form.password_confirmation}
                  onChange={set('password_confirmation')}
                  placeholder="Re-enter password"
                  error={errors.password_confirmation?.[0]}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
            disabled={!codeFilled}
          >
            Set password
          </Button>

          {isSocial && (
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('social_setpw_sent');
                navigate('/onboarding', { replace: true });
              }}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700 pt-1"
            >
              Skip for now — you can set a password later
            </button>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
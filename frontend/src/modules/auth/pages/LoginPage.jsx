import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import SocialButtons from '../components/SocialButtons';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { loginSchema } from '../schemas';
import { useAuthStore } from '../../../stores/authStore';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);
  const setRequiresMfa = useAuthStore((s) => s.setRequiresMfa);

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: k === 'remember' ? e.target.checked : e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }

    setSubmitting(true);
    try {
      const result = await authService.login(parsed.data);

      if (result.requires_mfa) {
        setRequiresMfa();
        navigate('/mfa/verify', { replace: true });
        return;
      }

      const user = result.data;
      setUser(user);

      const redirectTo = location.state?.from?.pathname;
      if (!user.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      } else if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const apiErrors = extractErrors(err);
      setErrors(apiErrors);
      setBanner(firstGeneral(apiErrors));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your journey."
      footer={
        <p className="text-sm text-center text-slate-500">
          New to Travel Marketplace?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {banner && <Alert variant="error">{banner}</Alert>}

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className={inputClass(errors.email)}
          />
          {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email[0]}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            autoComplete="current-password"
            value={form.password}
            onChange={set('password')}
            placeholder="Enter password"
            error={errors.password?.[0]}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={set('remember')}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Keep me signed in
        </label>

        <Button type="submit" loading={submitting} size="lg" className="w-full">
          Sign in
        </Button>

        <div className="relative flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <SocialButtons disabled={submitting} />
      </form>
    </AuthLayout>
  );
}

function inputClass(error) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4 ${
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
  }`;
}
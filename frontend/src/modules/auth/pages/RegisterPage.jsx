import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import SocialButtons from '../components/SocialButtons';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { registerSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

const initial = { name: '', email: '', password: '', password_confirmation: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await authService.register(parsed.data);
      navigate(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`, {
        replace: true,
      });
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
      title="Create your account"
      subtitle="Start your journey in minutes."
      footer={
        <p className="text-sm text-center text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {banner && <Alert variant="error">{banner}</Alert>}

        <Field label="Full name" error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            placeholder="John Doe"
            className={inputClass(errors.name)}
          />
        </Field>

        <Field label="Email address" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className={inputClass(errors.email)}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            placeholder="Minimum 8 characters"
            error={null}
          />
        </Field>

        <Field label="Confirm password" error={errors.password_confirmation}>
          <PasswordInput
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            placeholder="Re-enter password"
            error={null}
          />
        </Field>

        <Button type="submit" loading={submitting} size="lg" className="w-full">
          Create account
        </Button>

        <p className="text-xs text-center text-slate-400 leading-relaxed">
          By creating an account you agree to our Terms & Privacy Policy.
        </p>

        <Divider />
        <SocialButtons disabled={submitting} />
      </form>
    </AuthLayout>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function Divider() {
  return (
    <div className="relative flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 uppercase tracking-wider">or continue with</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function inputClass(error) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4 ${
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
  }`;
}
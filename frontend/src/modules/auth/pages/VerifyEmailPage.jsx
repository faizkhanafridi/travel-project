import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import Input from '../../../shared/components/Input';
import CodeInput from '../../../shared/components/CodeInput';
import Button from '../../../shared/components/Button';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import { useResendVerification } from '../hooks/useResendVerification';
import { resolvePostAuthRoute } from '../../../shared/lib/postAuthRoute';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [formError, setFormError] = useState('');

  const verify = useVerifyEmail();
  const resend = useResendVerification();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email) return setFormError('Enter your email');
    if (code.length !== 6) return setFormError('Enter the 6-digit code');

    const res = await verify.mutateAsync({ email, code }).catch(() => null);
    if (res?.data) {
      navigate(resolvePostAuthRoute(res.data), { replace: true });
    }
  };

  const onResend = async () => {
    if (!email) return setFormError('Enter your email to resend');
    await resend.mutateAsync({ email }).catch(() => null);
    setCooldown(60);
  };

  const codeError =
    verify.error?.errors?.code?.[0] ||
    verify.error?.errors?.email?.[0] ||
    formError;

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox"
      footer={
        <Link to="/login" className="text-ink-600 hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-800">
            Verification code <span className="text-danger">*</span>
          </label>
          <CodeInput value={code} onChange={setCode} error={codeError} />
          {codeError && <p className="mt-1 text-xs text-danger">{codeError}</p>}
        </div>

        <Button type="submit" size="lg" loading={verify.isPending} className="w-full">
          Verify email
        </Button>

        <div className="text-center text-sm text-ink-600">
          Didn&apos;t receive it?{' '}
          <button
            type="button"
            onClick={onResend}
            disabled={resend.isPending || cooldown > 0}
            className="font-semibold text-primary hover:underline disabled:text-ink-400 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
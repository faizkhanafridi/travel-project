import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import Input from '../../../shared/components/Input';
import PasswordInput from '../../../shared/components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import Button from '../../../shared/components/Button';
import { setPasswordWithTokenSchema } from '../schemas/authSchemas';
import { useSetPasswordWithToken } from '../hooks/useSetPasswordWithToken';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const emailParam = params.get('email') || '';

  const setPwd = useSetPasswordWithToken();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(setPasswordWithTokenSchema),
    defaultValues: {
      email: emailParam,
      token,
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    reset({
      email: emailParam,
      token,
      password: '',
      password_confirmation: '',
    });
  }, [emailParam, token, reset]);

  const pwd = watch('password');

  const onSubmit = async (values) => {
    const res = await setPwd.mutateAsync(values).catch(() => null);
    if (res) navigate('/login', { replace: true });
  };

  // Missing token/email → invalid link fallback
  if (!token || !emailParam) {
    return (
      <AuthCard
        title="Set your password"
        subtitle="This link is missing or invalid."
        footer={
          <Link to="/login" className="text-ink-600 hover:underline">
            Back to login
          </Link>
        }
      >
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-3 text-sm text-ink-800">
          <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-ink-900">
              We couldn&apos;t validate this link.
            </p>
            <p className="mt-1 text-ink-700">
              Request a new one from the{' '}
              <Link to="/forgot-password" className="text-primary font-semibold underline">
                forgot password
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </AuthCard>
    );
  }

  const apiTokenError = setPwd.error?.errors?.token?.[0];
  const apiEmailError = setPwd.error?.errors?.email?.[0];

  return (
    <AuthCard
      title="Set your password"
      subtitle="Your account uses social login. Set a password to also sign in with email."
      footer={
        <Link to="/login" className="text-ink-600 hover:underline">
          Back to login
        </Link>
      }
    >
      <div className="mb-4 rounded-lg bg-primary-light/60 border border-primary-ring/40 px-3 py-2 text-xs text-ink-700 flex items-start gap-2">
        <ShieldCheck size={14} className="text-primary mt-0.5 shrink-0" />
        <span>
          Social login will continue to work. Setting a password is optional but
          lets you sign in with email too.
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          error={errors.email?.message || apiEmailError}
          required
          readOnly
          {...register('email')}
        />

        <input type="hidden" {...register('token')} />

        <div>
          <PasswordInput
            label="New password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <PasswordStrength password={pwd} />
        </div>

        <PasswordInput
          label="Confirm new password"
          placeholder="Re-enter your password"
          error={errors.password_confirmation?.message}
          required
          {...register('password_confirmation')}
        />

        {apiTokenError && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
            {apiTokenError}{' '}
            <Link to="/forgot-password" className="font-semibold underline">
              Request a new link
            </Link>
          </div>
        )}

        <Button type="submit" size="lg" loading={setPwd.isPending} className="w-full">
          Set password
        </Button>
      </form>
    </AuthCard>
  );
}
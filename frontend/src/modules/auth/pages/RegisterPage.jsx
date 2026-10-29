import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../components/AuthCard';
import Input from '../../../shared/components/Input';
import PasswordInput from '../../../shared/components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import Button from '../../../shared/components/Button';
import SocialButtons from '../../../shared/components/SocialButtons';
import { registerSchema } from '../schemas/authSchemas';
import { useRegister } from '../hooks/useRegister';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', password_confirmation: '' },
  });

  const passwordValue = watch('password');

  const onSubmit = async (values) => {
    const res = await mutateAsync(values).catch(() => null);
    if (!res) return;
    navigate('/verify-email', {
      replace: true,
      state: { email: values.email, justRegistered: true },
    });
  };

  const emailApiError = error?.errors?.email?.[0];

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start planning trips you'll love"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message || emailApiError}
          required
          {...register('email')}
        />
        <div>
          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <PasswordStrength password={passwordValue} />
        </div>
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          error={errors.password_confirmation?.message}
          required
          {...register('password_confirmation')}
        />

        <Button type="submit" size="lg" loading={isPending} className="w-full">
          Create account
        </Button>

        <p className="text-xs text-ink-500 text-center">
          We will email you a 6-digit code to verify your account before it is
          created.
        </p>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-ink-200" />
        OR SIGN UP WITH
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <SocialButtons />
    </AuthCard>
  );
}
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../components/AuthCard';
import Input from '../../../shared/components/Input';
import PasswordInput from '../../../shared/components/PasswordInput';
import Button from '../../../shared/components/Button';
import { resetPasswordSchema } from '../schemas/authSchemas';
import { useResetPassword } from '../hooks/useResetPassword';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const emailParam = params.get('email') || '';

  const { mutateAsync, isPending, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailParam, token, password: '', password_confirmation: '' },
  });

  useEffect(() => {
    reset({ email: emailParam, token, password: '', password_confirmation: '' });
  }, [emailParam, token, reset]);

  const onSubmit = async (values) => {
    const res = await mutateAsync(values).catch(() => null);
    if (res) {
      navigate('/login', { replace: true });
    }
  };

  const tokenError = error?.errors?.token?.[0];

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Choose a new password for your account"
      footer={
        <Link to="/login" className="text-ink-600 hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          required
          {...register('email')}
        />
        <Input
          label="Reset token"
          placeholder="Paste the token from your email"
          error={errors.token?.message || tokenError}
          required
          {...register('token')}
        />
        <PasswordInput
          label="New password"
          error={errors.password?.message}
          required
          {...register('password')}
        />
        <PasswordInput
          label="Confirm new password"
          error={errors.password_confirmation?.message}
          required
          {...register('password_confirmation')}
        />
        <Button type="submit" size="lg" loading={isPending} className="w-full">
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
}
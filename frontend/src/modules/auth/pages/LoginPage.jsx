import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import AOS from 'aos';
import AuthCard from '../components/AuthCard';
import Input from '../../../shared/components/Input';
import PasswordInput from '../../../shared/components/PasswordInput';
import Button from '../../../shared/components/Button';
import SocialButtons from '../../../shared/components/SocialButtons';
import { loginSchema } from '../schemas/authSchemas';
import { useLogin } from '../hooks/useLogin';
import { resolvePostAuthRoute } from '../../../shared/lib/postAuthRoute';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    AOS.refresh();
  }, []);

  const onSubmit = async (values) => {
    const res = await mutateAsync(values).catch(() => null);
    if (!res?.data) return;
    const next = location.state?.from || resolvePostAuthRoute(res.data);
    navigate(next, { replace: true });
  };

  const apiError = error?.errors?.email?.[0] || error?.errors?.password?.[0];

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue your journey"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message || apiError}
          required
          {...register('email')}
        />
        <div>
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={isPending}
          className="w-full"
        >
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-ink-200" />
        OR CONTINUE WITH
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <SocialButtons />
    </AuthCard>
  );
}
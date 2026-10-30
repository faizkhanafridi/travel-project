import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../components/AuthCard';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { forgotPasswordSchema } from '../schemas/authSchemas';
import { useForgotPassword } from '../hooks/useForgotPassword';

export default function ForgotPasswordPage() {
  const { mutateAsync, isPending } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    await mutateAsync(values).catch(() => null);
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send you reset instructions"
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
          placeholder="you@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />
        <Button type="submit" size="lg" loading={isPending} className="w-full">
          Send reset instructions
        </Button>
        <p className="text-xs text-ink-500 text-center pt-1">
  If you signed up with Google or Facebook, we&apos;ll email you a
  &ldquo;Set your password&rdquo; link instead. Social login still works as
  usual.
</p>
      </form>
    </AuthCard>
  );
}
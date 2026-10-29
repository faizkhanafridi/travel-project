import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PasswordInput from '../../../shared/components/PasswordInput';
import Button from '../../../shared/components/Button';
import { changePasswordSchema } from '../schemas/authSchemas';
import { useChangePassword } from '../hooks/useChangePassword';

export default function ChangePasswordPage() {
  const { mutateAsync, isPending, error } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const onSubmit = async (values) => {
    const res = await mutateAsync(values).catch(() => null);
    if (res) reset();
  };

  const apiError = error?.errors?.current_password?.[0];

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-ink-900">Change password</h1>
      <p className="mt-1 text-sm text-ink-600">
        Keep your account safe by using a strong, unique password.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 bg-white rounded-xl2 border border-ink-200 shadow-card p-6 space-y-4"
        noValidate
      >
        <PasswordInput
          label="Current password"
          error={errors.current_password?.message || apiError}
          required
          {...register('current_password')}
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
        <Button type="submit" loading={isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
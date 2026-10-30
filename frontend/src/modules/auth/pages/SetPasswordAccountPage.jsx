import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck } from 'lucide-react';
import PasswordInput from '../../../shared/components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import Button from '../../../shared/components/Button';
import { setPasswordSchema } from '../schemas/authSchemas';
import { useSetPassword } from '../hooks/useSetPassword';
import useAuthStore from '../../../shared/stores/authStore';

export default function SetPasswordAccountPage() {
  const navigate = useNavigate();
  const setPwd = useSetPassword();
  const user = useAuthStore((s) => s.user);

  if (user?.has_password) {
    navigate('/change-password', { replace: true });
    return null;
  }

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const pwd = watch('password');

  const onSubmit = async (values) => {
    const res = await setPwd.mutateAsync(values).catch(() => null);
    if (res) {
      reset();
      navigate('/profile', { replace: true });
    }
  };

  const apiError =
    setPwd.error?.errors?.password?.[0] ||
    setPwd.error?.errors?.password_confirmation?.[0];

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="grid place-items-center h-10 w-10 rounded-lg bg-primary-light text-primary">
            <Lock size={18} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Set your password</h1>
            <p className="text-sm text-ink-600">
              Your account was created with a social login and has no password
              yet.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-primary-light/60 border border-primary-ring/40 px-3 py-2 text-xs text-ink-700 flex items-start gap-2">
          <ShieldCheck size={14} className="text-primary mt-0.5 shrink-0" />
          <span>
            Setting a password lets you log in with email too. Social login will
            continue to work as before.
          </span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          <div>
            <PasswordInput
              label="New password"
              placeholder="At least 8 characters"
              error={errors.password?.message || apiError}
              required
              {...register('password')}
            />
            <PasswordStrength password={pwd} />
          </div>

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
            error={errors.password_confirmation?.message}
            required
            {...register('password_confirmation')}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={setPwd.isPending}>
              Set password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
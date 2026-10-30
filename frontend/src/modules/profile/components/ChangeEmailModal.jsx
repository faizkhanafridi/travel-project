import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import PasswordInput from '../../../shared/components/PasswordInput';
import CodeInput from '../../../shared/components/CodeInput';
import Button from '../../../shared/components/Button';
import EmailChangeStepper from '../components/EmailChangeStepper';
import {
  codeSchema,
  emailChangeInitiateSchema,
  emailChangePasswordSchema,
} from '../schemas/profileSchemas';
import { useInitiateEmailChange } from '../hooks/useInitiateEmailChange';
import { useInitiateEmailChangeWithPassword } from '../hooks/useInitiateEmailChangeWithPassword';
import { useVerifyCurrentEmailCode } from '../hooks/useVerifyCurrentEmailCode';
import { useVerifyNewEmailCode } from '../hooks/useVerifyNewEmailCode';

/**
 * Multi-step email change modal. States:
 *  - initiate (standard flow: send code to current email)
 *  - noAccess  (alternative: current password → code to new email)
 *  - verifyCurrent (code arrived to current email)
 *  - verifyNew     (code arrived to new email — from either flow)
 */
export default function ChangeEmailModal({
  open,
  onClose,
  currentEmail,
  hasPassword = true,
}) {
  const [step, setStep] = useState('initiate');
  const [newEmail, setNewEmail] = useState('');

  const reset = () => {
    setStep('initiate');
    setNewEmail('');
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Change email"
    >
      <EmailChangeStepper
        current={
          step === 'initiate' || step === 'noAccess'
            ? 'initiate'
            : step === 'verifyCurrent'
            ? 'current'
            : 'new'
        }
      />

      {step === 'initiate' && (
        <InitiateStep
          currentEmail={currentEmail}
          hasPassword={hasPassword}
          onSent={(email) => {
            setNewEmail(email);
            setStep('verifyCurrent');
          }}
          onNoAccess={() => setStep('noAccess')}
          onCancel={handleClose}
        />
      )}

      {step === 'noAccess' && (
        <PasswordStep
          hasPassword={hasPassword}
          onSent={(email) => {
            setNewEmail(email);
            setStep('verifyNew');
          }}
          onBack={() => setStep('initiate')}
        />
      )}

      {step === 'verifyCurrent' && (
        <VerifyStep
          title="Verify your current email"
          subtitle={`We sent a 6-digit code to ${currentEmail}. Enter it below to authorize this change.`}
          useVerify={useVerifyCurrentEmailCode}
          onSuccess={() => setStep('verifyNew')}
          onBack={() => setStep('initiate')}
        />
      )}

      {step === 'verifyNew' && (
        <VerifyStep
          title="Verify your new email"
          subtitle={`We sent a 6-digit code to ${newEmail}. Enter it below to confirm.`}
          useVerify={useVerifyNewEmailCode}
          onSuccess={handleClose}
          successRedirectLabel="Done"
        />
      )}
    </Modal>
  );
}

function InitiateStep({ currentEmail, hasPassword, onSent, onNoAccess, onCancel }) {
  const initiate = useInitiateEmailChange();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailChangeInitiateSchema),
    defaultValues: { new_email: '' },
  });

  const onSubmit = async (values) => {
    const res = await initiate.mutateAsync(values.new_email).catch(() => null);
    if (res) onSent(values.new_email);
  };

  const apiError = initiate.error?.errors?.new_email?.[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-ink-600">
        Update your account email address.
      </p>

      <Input
        label="New email address"
        type="email"
        placeholder="new@example.com"
        required
        error={errors.new_email?.message || apiError}
        {...register('new_email')}
      />

      <p className="text-xs text-ink-500">
        We&apos;ll send a 6-digit code to your current registered email address
        ({currentEmail}) to authorize this change.
      </p>

      {hasPassword && (
        <button
          type="button"
          onClick={onNoAccess}
          className="text-sm text-primary font-semibold hover:underline"
        >
          I can&apos;t access my current email
        </button>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={initiate.isPending}>
          Send code
        </Button>
      </div>
    </form>
  );
}

function PasswordStep({ hasPassword, onSent, onBack }) {
  const initiate = useInitiateEmailChangeWithPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailChangePasswordSchema),
    defaultValues: { new_email: '', current_password: '' },
  });

  const onSubmit = async (values) => {
    const res = await initiate
      .mutateAsync({
        newEmail: values.new_email,
        currentPassword: values.current_password,
      })
      .catch(() => null);
    if (res) onSent(values.new_email);
  };

  if (!hasPassword) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-700">
          Your account doesn&apos;t have a password set (social login). Please
          set a password first, then come back to change your email.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const apiErrorPwd = initiate.error?.errors?.current_password?.[0];
  const apiErrorEmail = initiate.error?.errors?.new_email?.[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-ink-600">
        Verify your identity using your current password.
      </p>

      <Input
        label="New email address"
        type="email"
        placeholder="new@example.com"
        required
        error={errors.new_email?.message || apiErrorEmail}
        {...register('new_email')}
      />

      <PasswordInput
        label="Current account password"
        placeholder="Enter your current password"
        required
        error={errors.current_password?.message || apiErrorPwd}
        {...register('current_password')}
      />

      <p className="text-xs text-ink-500">
        After your password is verified, we&apos;ll send a verification code to
        your new email address.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" loading={initiate.isPending}>
          Continue with verification
        </Button>
      </div>
    </form>
  );
}

function VerifyStep({
  title,
  subtitle,
  useVerify,
  onSuccess,
  onBack,
  successRedirectLabel = 'Continue',
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const verify = useVerify();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const parsed = codeSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid code');
      return;
    }
    const res = await verify.mutateAsync(code).catch(() => null);
    if (res) onSuccess();
  };

  const apiError = verify.error?.errors?.code?.[0];

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        <p className="mt-1 text-sm text-ink-600">{subtitle}</p>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-ink-800">
          Verification code <span className="text-danger">*</span>
        </label>
        <CodeInput value={code} onChange={setCode} error={error || apiError} />
        {(error || apiError) && (
          <p className="mt-1 text-xs text-danger">{error || apiError}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" loading={verify.isPending}>
          {successRedirectLabel}
        </Button>
      </div>
    </form>
  );
}
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import OtpInput from '../../auth/components/OtpInput';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { profileService } from '../services/profileService';
import { useAuthStore } from '../../../stores/authStore';
import { emailCodeSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

// Modal shown after ChangeEmailModal hands over the active request.
// Handles: verify-current → verify-new → success. Also shows the state
// when a user opens it via a link (?stage=current|new&email=...&code=...)
// or via deep state from GET /email/status.
export default function EmailChangeModal({ active, onClose, onCompleted }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [stage, setStage] = useState(active?.stage || 'CURRENT_EMAIL_VERIFY');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    const parsed = emailCodeSchema.safeParse({ code });
    if (!parsed.success) {
      setErrors({ code: parsed.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      if (stage === 'CURRENT_EMAIL_VERIFY') {
        const result = await profileService.verifyCurrentEmail(parsed.data);
        setStage('NEW_EMAIL_VERIFY');
        setCode('');
        setResendMsg(
          `A verification code was sent to ${result.data?.new_email || 'your new email'}.`
        );
      } else {
        const result = await profileService.verifyNewEmail(parsed.data);
        if (result?.data) setUser(result.data);
        onCompleted?.(result.data);
      }
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setBanner(null);
    setResendMsg(null);
    setResending(true);
    try {
      // Backend has no dedicated "resend" endpoint — restarting the flow sends new codes.
      // For CURRENT stage we cannot restart without the new_email; for NEW stage we
      // use start-with-password fallback is not viable here either, so we surface
      // the message and let the user cancel and restart from the profile page.
      setResendMsg(
        'To resend, cancel this request and start again from the profile page.'
      );
      setCooldown(30);
    } finally {
      setResending(false);
    }
  };

  const cancel = async () => {
    try {
      await profileService.cancelEmailChange();
    } catch {
      // ignore
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {stage === 'CURRENT_EMAIL_VERIFY'
              ? 'Confirm current email'
              : 'Verify new email'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {banner && <Alert variant="error">{banner}</Alert>}
          {resendMsg && <Alert variant="info">{resendMsg}</Alert>}

          <p className="text-sm text-slate-600">
            {stage === 'CURRENT_EMAIL_VERIFY'
              ? 'Enter the 6-digit code sent to your current email address.'
              : `Enter the 6-digit code sent to ${active?.new_email || 'your new email'}.`}
          </p>

          <OtpInput
            value={code}
            onChange={setCode}
            disabled={loading}
            error={errors.code?.[0] || errors.code}
          />

          <div className="text-center text-sm text-slate-500">
            Didn't get the code?{' '}
            <button
              type="button"
              onClick={resend}
              disabled={resending || cooldown > 0}
              className="font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={cancel}>
              Cancel request
            </Button>
            <Button type="submit" loading={loading}>
              {stage === 'CURRENT_EMAIL_VERIFY' ? 'Verify current' : 'Verify new'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
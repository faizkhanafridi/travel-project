import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../stores/authStore';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function MfaChallengePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [codeError, setCodeError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCodeError(null);
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.mfaVerify({ code });
      const user = result.data;
      setUser(user);
      if (!user.onboarding_completed) navigate('/onboarding', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      const errs = extractErrors(err);
      setCodeError(errs.code?.[0] || null);
      setError(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <OtpInput value={code} onChange={setCode} disabled={loading} error={codeError} />
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Verify & continue
        </Button>
        <p className="text-xs text-center text-slate-400">
          Lost access? Contact platform support to recover your account.
        </p>
      </form>
    </AuthLayout>
  );
}
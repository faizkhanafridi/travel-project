import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import OtpInput from '../../auth/components/OtpInput';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import { profileService } from '../services/profileService';
import { useAuthStore } from '../../../stores/authStore';
import { emailCodeSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function EmailChangeConfirmPage({ stage: stageProp }) {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const stage =
    stageProp ||
    (window.location.pathname.includes('confirm-new')
      ? 'NEW_EMAIL_VERIFY'
      : 'CURRENT_EMAIL_VERIFY');

  const emailParam = search.get('email') || '';
  const codeParam = search.get('code') || '';

  const [code, setCode] = useState(codeParam);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [guardState, setGuardState] = useState('checking'); // checking | ok | blocked
  const autoSubmitted = useRef(false);

  // Verify that an active email change exists AND the current stage matches.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return; // handled below
      try {
        const res = await profileService.emailStatus();
        const active = res?.data;
        if (cancelled) return;
        if (!active || active.stage !== stage) {
          setGuardState('blocked');
        } else {
          setGuardState('ok');
        }
      } catch {
        if (!cancelled) setGuardState('blocked');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, stage]);

  useEffect(() => {
    if (guardState !== 'ok') return;
    if (emailParam && codeParam && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submit(emailParam, codeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardState]);

  const submit = async (_email, _code) => {
    setErrors({});
    setBanner(null);
    const parsed = emailCodeSchema.safeParse({ code: _code ?? code });
    if (!parsed.success) {
      setErrors({ code: parsed.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      if (stage === 'CURRENT_EMAIL_VERIFY') {
        await profileService.verifyCurrentEmail(parsed.data);
        setSuccessMsg(
          `Current email confirmed. A verification code was sent to ${
            emailParam || 'your new email'
          }.`
        );
        setTimeout(() => navigate('/profile'), 1200);
      } else {
        const result = await profileService.verifyNewEmail(parsed.data);
        if (result?.data) setUser(result.data);
        setSuccessMsg('Email updated successfully.');
        setTimeout(() => navigate('/profile'), 1200);
      }
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    submit(emailParam, code);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Alert variant="info">
            Please sign in to continue verifying your email change.
          </Alert>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (guardState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Checking your request…" />
      </div>
    );
  }

  if (guardState === 'blocked') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <Alert variant="error">
            This email change link is invalid or has expired. Start a new email
            change from your profile.
          </Alert>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back to profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-extrabold text-slate-900 mb-1">
            {stage === 'CURRENT_EMAIL_VERIFY'
              ? 'Confirm current email'
              : 'Verify new email'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {stage === 'CURRENT_EMAIL_VERIFY'
              ? 'Enter the 6-digit code sent to your current email address.'
              : `Enter the 6-digit code sent to ${emailParam || 'your new email'}.`}
          </p>

          {banner && <Alert variant="error">{banner}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          {!successMsg && (
            <form onSubmit={onSubmit} className="space-y-5">
              <OtpInput
                value={code}
                onChange={setCode}
                disabled={loading}
                error={errors.code?.[0] || errors.code}
              />
              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full"
              >
                {stage === 'CURRENT_EMAIL_VERIFY' ? 'Verify current' : 'Verify new'}
              </Button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { inputClass } from './ProfileField';
import { startEmailChangeSchema, startEmailChangeWithPasswordSchema } from '../schemas';
import { profileService } from '../services/profileService';
import { extractErrors, firstGeneral } from '../../../lib/errors';

export default function ChangeEmailModal({ currentEmail, hasPassword, onClose, onSent }) {
  const [mode, setMode] = useState('standard');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const schema = mode === 'standard' ? startEmailChangeSchema : startEmailChangeWithPasswordSchema;
    const payload = mode === 'standard' ? { new_email: newEmail } : { new_email: newEmail, current_password: password };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === 'standard'
          ? await profileService.startEmailChange(parsed.data)
          : await profileService.startEmailChangeWithPassword(parsed.data);
      onSent?.(result.data);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Change email</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {banner && <Alert variant="error">{banner}</Alert>}

          {mode === 'standard' ? (
            <>
              <p className="text-sm text-slate-600">
                Update your account email address.
              </p>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  New email address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className={inputClass(errors.new_email)}
                />
                {errors.new_email && (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.new_email[0]}</p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                We'll send a 6-digit code to your current registered email address{' '}
                <strong>{currentEmail}</strong> to authorize this change.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode(hasPassword ? 'password' : 'standard');
                  setErrors({});
                  setBanner(null);
                }}
                disabled={!hasPassword}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:text-slate-400"
              >
                {hasPassword
                  ? "I can't access my current email"
                  : "I can't access my current email (no password set)"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Verify your identity using your current password.
              </p>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  New email address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={inputClass(errors.new_email)}
                />
                {errors.new_email && (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.new_email[0]}</p>
                )}
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Current account password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className={inputClass(errors.current_password)}
                />
                {errors.current_password && (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.current_password[0]}</p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                After your password is verified, we'll send a verification code to the new
                email address.
              </p>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {mode === 'password' && (
              <Button type="button" variant="ghost" onClick={() => setMode('standard')}>
                Back
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'standard' ? 'Send code' : 'Continue with verification'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
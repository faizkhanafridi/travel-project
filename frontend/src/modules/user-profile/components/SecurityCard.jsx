import { useState } from "react";
import { KeyRound, Shield, Check, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import PasswordInput from "../../auth/components/PasswordInput";
import { authService } from "../../auth/services/authService";
import { useAuthStore } from "../../../stores/authStore";
import {
  changePasswordSchema,
  setPasswordSchemaLoggedIn,
  resetPasswordSchema,
} from "../../auth/schemas";
import { extractErrors, firstGeneral } from "../../../lib/errors";
import { Link } from "react-router-dom";
export default function SecurityCard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const hasPassword = !!user?.has_password;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'set' | 'change'
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const startSet = () => {
    setMode("set");
    setOpen(true);
    setForm({ current_password: "", password: "", password_confirmation: "" });
    setErrors({});
    setBanner(null);
    setSuccess(null);
  };

  const startChange = () => {
    setMode("change");
    setOpen(true);
    setForm({ current_password: "", password: "", password_confirmation: "" });
    setErrors({});
    setBanner(null);
    setSuccess(null);
  };

  const close = () => {
    setOpen(false);
    setMode(null);
    setForm({ current_password: "", password: "", password_confirmation: "" });
    setErrors({});
    setBanner(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);
    setSuccess(null);

    if (mode === "change") {
      const parsed = changePasswordSchema.safeParse(form);
      if (!parsed.success) {
        const fe = {};
        for (const issue of parsed.error.issues)
          fe[issue.path[0]] = issue.message;
        setErrors(fe);
        return;
      }
      setLoading(true);
      try {
        await authService.changePassword(parsed.data);
        setUser({ ...user, has_password: true });
        setSuccess("Password updated successfully.");
        setForm({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        setTimeout(() => close(), 1200);
      } catch (err) {
        const errs = extractErrors(err);
        setErrors(errs);
        setBanner(firstGeneral(errs));
      } finally {
        setLoading(false);
      }
      return;
    }

    // set password (social-only users): reuse the forgot-password flow that
    // sends a code, then verify with set-password endpoint.
    const parsed = setPasswordSchemaLoggedIn.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues)
        fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }
    setLoading(true);
    try {
      // 1) Request a code to the current email
      await authService.forgotPassword({ email: user.email });
      setSuccess(
        "We sent a 6-digit code to your email. Open the link below to finish setting your password.",
      );
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-brand-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Password & security
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {hasPassword
              ? "Change your account password at any time."
              : "Set a password so you can sign in without your social account."}
          </p>
        </div>
        {hasPassword ? (
          <button
            type="button"
            onClick={startChange}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 shrink-0"
          >
            Change password
          </button>
        ) : (
          <button
            type="button"
            onClick={startSet}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 shrink-0"
          >
            Set password
          </button>
        )}
      </div>

      {success && (
        <div className="mt-4">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      {open && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-700" />
              {mode === "change" ? "Change password" : "Set password"}
            </h3>
            <button
              type="button"
              onClick={close}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {banner && <Alert variant="error">{banner}</Alert>}

          <form onSubmit={submit} className="space-y-3">
            {mode === "change" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Current password
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authService.logout();
                      } catch {
                        // ignore
                      }
                      useAuthStore.getState().clearUser();
                      window.location.href = `/forgot-password?email=${encodeURIComponent(user?.email || "")}`;
                    }}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Forgot current password?
                  </button>
                </div>
                <PasswordInput
                  autoComplete="current-password"
                  value={form.current_password}
                  onChange={set("current_password")}
                  placeholder="Enter current password"
                  error={errors.current_password?.[0]}
                />
              </div>
            )}

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                New password
              </label>
              <PasswordInput
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                placeholder="Minimum 8 characters"
                error={errors.password?.[0]}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Confirm new password
              </label>
              <PasswordInput
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={set("password_confirmation")}
                placeholder="Re-enter password"
                error={errors.password_confirmation?.[0]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {mode === "change"
                  ? "Update password"
                  : "Send code to set password"}
              </Button>
            </div>
          </form>

          {mode === "set" && success && (
            <p className="text-sm text-slate-600">
              Once you have the code,{" "}
              <a
                href={`/set-password?email=${encodeURIComponent(user.email)}`}
                className="font-semibold text-brand-700 hover:text-brand-800"
              >
                click here to finish setting your password
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Shield, ArrowRight } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import Alert from "../../../components/ui/Alert";
import ProfileForm from "../components/ProfileForm";
import ChangeEmailModal from "../components/ChangeEmailModal";
import EmailChangeModal from "../components/EmailChangeModal";
import {
  useMyProfile,
  useUpdateProfile,
  useEmailChangeStatus,
  useMyAgent,
} from "../hooks/useProfile";
import { useAuthStore } from "../../../stores/authStore";
import SecurityCard from "../components/SecurityCard";

export default function MyProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error } = useMyProfile();
  const update = useUpdateProfile();
  const emailStatus = useEmailChangeStatus();
  const agentQ = useMyAgent();
  const agentUuid = agentQ.data?.data?.uuid || null;
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [activeChange, setActiveChange] = useState(null);

  const profile = data?.data ?? null;

  useEffect(() => {
    const active = emailStatus.data?.data;
    if (active) setActiveChange(active);
  }, [emailStatus.data]);

  const handleSave = async (formData) => {
    await update.mutateAsync(formData);
  };

  const handleSent = (request) => {
    setShowChangeEmail(false);
    setActiveChange(request);
  };

  const handleCompleted = (updatedUser) => {
    setActiveChange(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-40 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Alert variant="error">Could not load profile.</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal information. Agency data is managed separately.
          </p>
        </div>

        {/* Email + account block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Email address
              </p>
              <p className="text-sm text-slate-600 mt-0.5">{user?.email}</p>
              {activeChange && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                  Email change in progress to{" "}
                  <strong>{activeChange.new_email}</strong>.{" "}
                  <button
                    onClick={() => setActiveChange(activeChange)}
                    className="font-semibold underline"
                  >
                    Continue verification
                  </button>
                </p>
              )}
            </div>
            <button
              onClick={() =>
                activeChange
                  ? setActiveChange(activeChange)
                  : setShowChangeEmail(true)
              }
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Change email
            </button>
          </div>
        </div>
        <SecurityCard />

        {/* Profile form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <ProfileForm
            initialProfile={profile}
            onSave={handleSave}
            saving={update.isPending}
          />
        </div>

        {/* Account status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 mt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Account status
              </p>
              <p className="text-sm text-slate-600 capitalize mt-0.5">
                {profile?.account_status || "customer"} · Member since{" "}
                {profile?.member_since
                  ? new Date(profile.member_since).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            {user?.is_customer && !user?.is_agent && (
              <button
                onClick={() => navigate("/become-agent")}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Become an agent
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {/* Public profile preview link */}
          </div>
        </div>
        {profile?.uuid && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.is_agent ? "Agency public profile" : "Public profile"}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {user?.is_agent
                    ? "This is how customers see your agency on Travel Marketplace."
                    : "This is how other members see you on Travel Marketplace."}
                </p>
              </div>
              <Link
                to={
                  user?.is_agent && agentUuid
                    ? `/agency/${agentUuid}`
                    : `/u/${profile.uuid}`
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                View profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {showChangeEmail && (
        <ChangeEmailModal
          currentEmail={user?.email}
          hasPassword={!!user?.has_password}
          onClose={() => setShowChangeEmail(false)}
          onSent={handleSent}
        />
      )}

      {activeChange && (
        <EmailChangeModal
          active={activeChange}
          onClose={() => setActiveChange(null)}
          onCompleted={handleCompleted}
        />
      )}
    </div>
  );
}

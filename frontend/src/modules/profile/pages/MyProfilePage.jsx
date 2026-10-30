import { useMemo, useState } from "react";
import { Mail, ShieldCheck, Edit3 } from "lucide-react";
import useAuthStore from "../../../shared/stores/authStore";
import { useMyProfile } from "../hooks/useMyProfile";
import { useSaveProfile } from "../hooks/useSaveProfile";
import { useLanguages } from "../hooks/useLanguages";
import ProfileForm from "../components/ProfileForm";
import ProfileSkeleton from "../components/ProfileSkeleton";
import Button from "../../../shared/components/Button";
import ChangeEmailModal from "../components/ChangeEmailModal";
import { useNavigate } from 'react-router-dom';
import { useRemovePhoto } from '../hooks/useRemovePhoto';

export default function MyProfilePage() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const query = useMyProfile();
  const languagesQuery = useLanguages();

  // Create + edit use separate mutations so the HTTP method matches backend state.
  const saveCreate = useSaveProfile({ isEdit: false });
  const saveEdit = useSaveProfile({ isEdit: true });
const removePhoto = useRemovePhoto();

  const [editing, setEditing] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const profile = query.data?.data || null;
  const allLanguages = languagesQuery.data?.data || [];

  // Pick the right mutation based on whether a profile already exists.
  const save = profile ? saveEdit : saveCreate;

  // Map profile languages (by code) → numeric ids using the fetched language list.
  const defaults = useMemo(() => {
    const codeToId = new Map(allLanguages.map((l) => [l.code, l.id]));

    return {
      username: profile?.username || "",
      display_name: profile?.display_name || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      date_of_birth: profile?.date_of_birth || "",
      address: profile?.address || "",
      language_ids: (profile?.languages || [])
        .map((l) => codeToId.get(l.code))
        .filter((id) => typeof id === "number"),
     profile_photo_url: toAbsoluteUrl(profile?.profile_photo_url),
    };
  }, [profile, allLanguages]);

  const onSubmit = async (values, photoFile) => {
    const res = await save
      .mutateAsync({ payload: values, photoFile })
      .catch(() => null);
    if (res?.data) setEditing(false);
  };

  // Resolves a possibly-relative storage URL against the API origin.
function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}
const handleRemovePhoto = async () => {
  await removePhoto.mutateAsync().catch(() => null);
};
  if (query.isLoading || languagesQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
          <h1 className="text-xl font-bold text-ink-900">No profile yet</h1>
          <p className="mt-1 text-sm text-ink-600">
            Create your profile to start using the marketplace.
          </p>
          <Button className="mt-4" onClick={() => setEditing(true)}>
            Create profile
          </Button>
        </div>

        {editing && (
          <div className="mt-6 rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
          <ProfileForm
  defaultValues={defaults}
  onSubmit={onSubmit}
  submitting={save.isPending}
  onCancel={() => setEditing(false)}
  submitLabel="Save profile"
  apiError={save.error?.errors}
  onRemovePhoto={handleRemovePhoto}  
/>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink-900">My profile</h1>
        {!editing && (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2"
          >
            <Edit3 size={16} /> Edit profile
          </Button>
        )}
      </div>

      {/* Account card */}
      <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-ink-500">
              Account
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-700">
              <Mail size={14} /> {user?.email}
              {user?.email_verified_at && (
                <span className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-ink-500 capitalize">
              Account type: {user?.account_type?.replace("_", " ")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button variant="outline" onClick={() => setEmailModalOpen(true)}>
              Change email
            </Button>

           {!user?.has_password && (
  <Button variant="primary" onClick={() => navigate('/set-password-account')}>
    Set password
  </Button>
)}
          </div>
        </div>
      </div>

      {/* Profile details / edit */}
      <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
        {editing ? (
      <ProfileForm
  defaultValues={defaults}
  onSubmit={onSubmit}
  submitting={save.isPending}
  onCancel={() => setEditing(false)}
  submitLabel="Save profile"
  apiError={save.error?.errors}
  onRemovePhoto={handleRemovePhoto}   
/>
        ) : (
          <ProfileReadOnly profile={profile} />
        )}
      </div>

      <ChangeEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        currentEmail={user?.email}
        hasPassword={!!user?.has_password}
      />
    </div>
  );
}

function ProfileReadOnly({ profile }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        <div className="h-24 w-24 rounded-full overflow-hidden border border-ink-200 bg-ink-100 grid place-items-center text-ink-500 text-2xl font-bold">
          {profile.profile_photo_url ? (
  <img
    src={toAbsoluteUrl(profile.profile_photo_url)}
    alt={profile.display_name}
    className="h-full w-full object-cover"
  />
) : (
            profile.display_name?.slice(0, 1).toUpperCase() || "U"
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-semibold text-ink-900">
            {profile.display_name}
          </h2>
          <p className="text-sm text-ink-600">@{profile.username}</p>
          <p className="text-xs text-ink-500 mt-1 capitalize">
            {profile.account_type?.replace("_", " ")}
          </p>
        </div>
      </div>

      {profile.bio && (
        <Field label="Bio">
          <p className="whitespace-pre-line text-sm text-ink-800">
            {profile.bio}
          </p>
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone">{profile.phone || "—"}</Field>
        <Field label="Date of birth">{profile.date_of_birth || "—"}</Field>
      </div>

      <Field label="Address">{profile.address || "—"}</Field>

      <Field label="Languages">
        {profile.languages?.length
          ? profile.languages.map((l) => l.name).join(", ")
          : "—"}
      </Field>

      <Field label="Member since">
        {profile.member_since
          ? new Date(profile.member_since).toLocaleDateString()
          : "—"}
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-ink-800">{children}</div>
    </div>
  );
}

// Resolves a possibly-relative storage URL against the API origin.
function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import ProfileForm from '../components/ProfileForm';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useSaveProfile } from '../hooks/useSaveProfile';
import { useMyProfile } from '../hooks/useMyProfile';
import useAuthStore from '../../../shared/stores/authStore';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const save = useSaveProfile({ isEdit: false });
  const profileQuery = useMyProfile();

  // Guard: show ONLY if user completed onboarding AND has no profile yet.
  useEffect(() => {
    if (!user) return;

    // Onboarding skipped → go home.
    if (!user.onboarding_completed) {
      navigate('/', { replace: true });
      return;
    }

    // Profile exists → go home (setup already done).
    if (profileQuery.isSuccess && profileQuery.data?.data) {
      navigate('/', { replace: true });
    }
  }, [user, profileQuery.isSuccess, profileQuery.data, navigate]);

  useEffect(() => {
    AOS.refresh();
  }, []);

  // Don't flash the form while we're checking profile existence.
  if (profileQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  const onSubmit = async (values, photoFile) => {
    const res = await save
      .mutateAsync({ payload: values, photoFile })
      .catch(() => null);
    if (!res?.data) return;

    if (user?.account_type === 'agent') {
      navigate('/become-agent', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const apiErrors = save.error?.errors;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6" data-aos="fade-down">
        <h1 className="text-2xl font-bold text-ink-900">
          Set up your profile
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Personalize your account. You can change these details later.
        </p>
      </div>

      <div
        className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6"
        data-aos="fade-up"
      >
        <ProfileForm
          defaultValues={{ username: '', display_name: '' }}
          onSubmit={onSubmit}
          submitting={save.isPending}
          submitLabel="Save & continue"
          onSkip={() => navigate('/', { replace: true })}
          apiError={apiErrors}
        />
      </div>
    </div>
  );
}
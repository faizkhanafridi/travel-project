import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '../hooks/usePublicProfile';
import PublicProfileHeader from '../components/PublicProfileHeader';
import ProfileSkeleton from '../components/ProfileSkeleton';
import Button from '../../../shared/components/Button';

export default function PublicProfilePage() {
  const { username } = useParams();
  const query = usePublicProfile(username);
  const profile = query.data?.data;

  if (query.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-ink-900">
          Profile not found
        </h1>
        <p className="mt-2 text-ink-600">
          This profile does not exist or is not publicly available.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="outline">Back to home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-xl2 border border-ink-200 bg-white shadow-card p-6">
        <PublicProfileHeader profile={profile} />
      </div>
    </div>
  );
}
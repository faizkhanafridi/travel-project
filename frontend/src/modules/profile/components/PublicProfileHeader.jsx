import { Calendar, Languages } from 'lucide-react';

function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export default function PublicProfileHeader({ profile }) {
  if (!profile) return null;

  const photoUrl = toAbsoluteUrl(profile.profile_photo_url);

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <div className="h-28 w-28 rounded-full overflow-hidden border border-ink-200 bg-ink-100 grid place-items-center text-ink-500 text-3xl font-bold">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={profile.display_name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          profile.display_name?.slice(0, 1).toUpperCase() || 'U'
        )}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-ink-900">
          {profile.display_name}
        </h1>
        <p className="text-ink-600">@{profile.username}</p>

        {profile.bio && (
          <p className="mt-3 text-sm text-ink-700 max-w-2xl whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-ink-600">
          {profile.member_since && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} />
              Member since {formatDate(profile.member_since)}
            </span>
          )}
          {Array.isArray(profile.languages) && profile.languages.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Languages size={14} />
              {profile.languages.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
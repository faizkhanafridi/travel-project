import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, Calendar, ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import { usePublicProfile } from '../hooks/useProfile';

export default function PublicProfilePage() {
  const { uuid } = useParams();
  const { data, isLoading, error } = usePublicProfile(uuid);
  const profile = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-20 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">This profile is not available.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden ring-4 ring-white shadow">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.display_name}    
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                  {(profile.display_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {profile.display_name}
              </h1>
              {profile.username && (
                <p className="text-sm text-slate-500">@{profile.username}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                {profile.city && profile.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.city}, {profile.country}
                  </span>
                )}
                {profile.member_since && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since{' '}
                    {new Date(profile.member_since).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {profile.account_status && (
                  <span className="inline-flex items-center gap-1 capitalize">
                    <Globe className="w-3.5 h-3.5" />
                    {profile.account_status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">About</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
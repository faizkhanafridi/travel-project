import { Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../stores/authStore';

export default function ProfileSetupPlaceholder() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
          <User className="w-7 h-7 text-brand-700" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Profile setup is coming soon
        </h1>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          Module 02 — User Profiles will let you set your username, display name,
          profile photo, bio, languages, and contact details.
        </p>

        {user && (
          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Signed in as</span>
            <span>{user.email}</span>
          </div>
        )}

        <div className="mt-8">
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
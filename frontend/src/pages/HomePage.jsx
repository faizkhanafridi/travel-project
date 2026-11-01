import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Compass, Shield, Sparkles, User } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, #fff 0, transparent 40%), radial-gradient(circle at 85% 80%, #fff 0, transparent 45%)',
            }}
          />
          <div className="relative">
            <p className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {greeting}, {user?.name?.split(' ')[0] || 'traveler'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Your travel journey starts here
            </h1>
            <p className="text-white/80 max-w-lg mb-6">
              Authentication, profiles, and agent onboarding are live.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold">
                ✅ Module 01 — Authentication
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold">
                ✅ Module 02 — User Profiles
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold">
                ✅ Module 03 — Agent
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white/70">
                Module 04 — Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Card
            icon={User}
            title="Complete your profile"
            description="Add your photo, bio, and preferences to personalize your account."
            cta="Open my profile"
            to="/profile"
          />
          {user?.is_super_admin ? (
            <Card
              icon={Shield}
              title="Admin: agent applications"
              description="Review, approve, or reject pending agent applications."
              cta="Open admin"
              to="/admin/agents"
              accent
            />
          ) : user?.is_customer && !user?.is_agent ? (
            <Card
              icon={Briefcase}
              title="Become an agent"
              description="Apply to sell travel services, receive custom requests, and earn with 98% payout."
              cta="Start application"
              to="/agent/apply"
              accent
            />
         ) : user?.is_agent ? (
  <Card
    icon={Briefcase}
    title="Manage your agency"
    description="Edit agency information, business details, and operating hours."
    cta="Open account"
    to="/agent/account"
  />
) : (
            <Card
              icon={Compass}
              title="Browse marketplace"
              description="Explore verified services from local agencies across the globe."
              cta="Coming soon"
              to="/"
              disabled
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Card({ icon: Icon, title, description, cta, to, accent, disabled }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        accent
          ? 'border-brand-200 bg-gradient-to-br from-brand-50 to-white'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
          accent ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">{description}</p>
      <Link
        to={to}
        aria-disabled={disabled}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
          disabled
            ? 'text-slate-400 pointer-events-none'
            : accent
            ? 'text-brand-700 hover:text-brand-800'
            : 'text-slate-700 hover:text-slate-900'
        }`}
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
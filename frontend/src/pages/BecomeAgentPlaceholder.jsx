import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, ShieldCheck, Wallet } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../stores/authStore';

export default function BecomeAgentPlaceholder() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
            <Briefcase className="w-7 h-7 text-brand-700" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Become a travel agent — Coming Soon
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            Module 03 — Agent will let you apply to sell travel services, submit
            offers on travel posts, and manage your agency.
          </p>
        </div>

        {user?.is_agent ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm text-emerald-800">
            You're already an approved agent. The agent dashboard will be available soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <Feature
              icon={Briefcase}
              title="Sell travel services"
              description="Create service listings that customers can book directly."
            />
            <Feature
              icon={Wallet}
              title="Keep 98% of earnings"
              description="Only a 2% platform commission on completed bookings."
            />
            <Feature
              icon={ShieldCheck}
              title="Verified & trusted"
              description="Get verified once and build a trustworthy reputation."
            />
          </div>
        )}

        <div className="text-center mt-10">
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

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
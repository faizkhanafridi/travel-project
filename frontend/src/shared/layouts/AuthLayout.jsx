import { Outlet } from 'react-router-dom';
import { Plane, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left: form */}
      <div className="flex flex-col">
        <main className="flex-1 grid place-items-center px-4 py-10">
          <Outlet />
        </main>
      </div>

      {/* Right: brand panel */}
      <aside className="hidden lg:flex relative bg-primary-light overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 m-auto max-w-md p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles size={14} /> Trusted travel marketplace
          </div>
          <h2 className="mt-5 text-3xl font-bold text-ink-900 leading-tight">
            Plan extraordinary journeys with verified travel agents.
          </h2>
          <p className="mt-3 text-ink-700">
            Discover curated trips, request custom itineraries, and book with
            confidence — all in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-800">
            <li className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" /> Secure Sanctum
              session authentication
            </li>
            <li className="flex items-center gap-2">
              <Plane size={18} className="text-primary" /> Global destinations and
              local experts
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
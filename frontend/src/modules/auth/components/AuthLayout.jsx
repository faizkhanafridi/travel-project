import { Link } from 'react-router-dom';
import { Plane, Globe2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left: form */}
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Plane className="w-5 h-5 text-white -rotate-45" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              Travel Marketplace
            </span>
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center py-8 w-full max-w-md mx-auto">
          {title && (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-slate-500 mb-8 text-[15px]">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="w-full max-w-md mx-auto">{footer}</div>}
      </div>

      {/* Right: marketing gradient panel */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 80%, #fff 0, transparent 45%)',
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <Sparkles className="w-4 h-4" />
            Trusted by travelers & agents worldwide
          </div>

          <div className="max-w-sm">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Discover the world.<br /> Book with confidence.
            </h2>
            <p className="text-white/80 leading-relaxed">
              Verified agencies, secure escrow payments, and handcrafted trips for every
              adventure — from Umrah to honeymoons.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <Feature icon={ShieldCheck} text="Bank-grade security & verified agents" />
            <Feature icon={Globe2} text="Travel services across 60+ destinations" />
            <Feature icon={Sparkles} text="Personalized itineraries, handpicked offers" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 text-white/85">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <span>{text}</span>
    </div>
  );
}
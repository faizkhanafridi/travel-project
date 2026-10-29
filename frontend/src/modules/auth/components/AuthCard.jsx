import { useEffect } from 'react';
import AOS from 'aos';
import Logo from '../../../shared/components/Logo';

export default function AuthCard({ title, subtitle, children, footer }) {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="w-full max-w-[440px]" data-aos="fade-up">
      <div className="mb-6 flex justify-center">
        <Logo size="md" />
      </div>
      <div className="rounded-xl2 bg-white border border-ink-200 shadow-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-center text-sm text-ink-600">{footer}</div>}
    </div>
  );
}
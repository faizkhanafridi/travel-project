export default function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
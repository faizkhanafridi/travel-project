export default function TravelPostStatusBadge({ status }) {
  const map = {
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
    AWARDED: 'bg-brand-50 text-brand-700 border-brand-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${map[status] || map.CLOSED}`}
    >
      {String(status || '').replace('_', ' ')}
    </span>
  );
}
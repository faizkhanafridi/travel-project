import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import Navbar from '../../../../components/layout/Navbar';
import Alert from '../../../../components/ui/Alert';
import { useAdminAgents } from '../../hooks/useAgent';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING_REVIEW', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function AdminAgentsPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const params = { status, search };
  const { data, isLoading, error } = useAdminAgents(params);

  const items = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Agent applications</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage agent applications.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agency, owner, email…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value || 'all'}
                onClick={() => setStatus(f.value)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                  status === f.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && <Alert variant="error">Could not load applications.</Alert>}

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Agency</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Attempt</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No applications match the current filters.
                    </td>
                  </tr>
                ) : (
                  items.map((a) => (
                    <tr key={a.uuid} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {a.agency || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800">{a.owner || '—'}</p>
                        <p className="text-xs text-slate-500">{a.owner_email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">#{a.attempt}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.submitted_at
                          ? new Date(a.submitted_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/agents/${a.uuid}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Review
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50">
              Page {meta.current_page} of {meta.last_page}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-sky-50 text-sky-700 border-sky-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${map[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}
    >
      {String(status || '').replace('_', ' ')}
    </span>
  );
}
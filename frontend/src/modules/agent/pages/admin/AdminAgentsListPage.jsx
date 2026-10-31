import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAdminAgents } from '../../hooks/admin/useAdminAgents';
import AgentTable from '../../components/admin/AgentTable';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';
import { cn } from '../../../../shared/lib/utils';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending_review', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'suspended', label: 'Suspended' },
];

export default function AdminAgentsListPage() {
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const query = useAdminAgents({ status: status || undefined, search: search || undefined, page });
  const agents = query.data?.data || [];
  const meta = query.data?.meta;

  const onSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Agent Applications</h1>
          <p className="text-sm text-ink-600 mt-0.5">
            Review and manage agent applications.
          </p>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 w-full sm:w-72">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by email or agency"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-ink-300 bg-white text-sm focus-ring"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-10">
            Search
          </Button>
        </form>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key || 'all'}
            type="button"
            onClick={() => {
              setStatus(tab.key);
              setPage(1);
            }}
            className={cn(
              'px-3 h-8 rounded-full text-xs font-semibold transition-colors',
              status === tab.key
                ? 'bg-primary text-white'
                : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="rounded-xl border border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
          Loading…
        </div>
      ) : (
        <AgentTable agents={agents} />
      )}

      {meta && meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
          <span>
            Page {meta.current_page} of {meta.last_page} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
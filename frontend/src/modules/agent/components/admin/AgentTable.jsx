import { Link } from 'react-router-dom';
import AgentStatusBadge from './AgentStatusBadge';
import Button from '../../../../shared/components/Button';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function AgentTable({ agents = [] }) {
  if (agents.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-8 text-center text-sm text-ink-600">
        No applications found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-3">Agency</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Attempt</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {agents.map((a) => (
            <tr key={a.uuid} className="hover:bg-ink-50">
              <td className="px-4 py-3 font-medium text-ink-900">
                {a.agency_name || '—'}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {a.agency_owner_name || a.owner?.email || '—'}
              </td>
              <td className="px-4 py-3 text-ink-600">
                #{a.latest_attempt?.attempt_number ?? a.current_attempt}
                
              </td>
              <td className="px-4 py-3">
                <AgentStatusBadge status={a.status} />
              </td>
              <td className="px-4 py-3 text-ink-600">
                {formatDate(a.latest_attempt?.submitted_at || a.submitted_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link to={`/admin/agents/${a.uuid}`}>
                  <Button size="sm" variant="outline">
                    Review →
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
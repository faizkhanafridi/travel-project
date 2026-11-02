import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, MoreVertical, Pencil, Trash2, Send, Eye, FileWarning,
} from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import { useMyServices, useCreateService, useDestroyService, useRequestRepublish } from '../hooks/useService';
import { serviceService } from '../services/serviceService';
import { republishSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'UNPUBLISHED', label: 'Unpublished' },
];

export default function MyServicesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const params = { status, search };
  const { data, isLoading, error } = useMyServices(params);
  const create = useCreateService();
  const destroy = useDestroyService();
  const [actionError, setActionError] = useState(null);
  const [republishOpen, setRepublishOpen] = useState(null);
  const [republishReason, setRepublishReason] = useState('');
  const [republishErr, setRepublishErr] = useState(null);

  const items = data?.data || [];
  const meta = data?.meta;

  const handleCreate = async () => {
    setActionError(null);
    try {
      const result = await create.mutateAsync();
      const uuid = result?.data?.uuid;
      if (uuid) navigate(`/services/mine/${uuid}`);
    } catch (err) {
      const errs = extractErrors(err);
      setActionError(firstGeneral(errs));
    }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    setActionError(null);
    try {
      await destroy.mutateAsync(uuid);
    } catch (err) {
      const errs = extractErrors(err);
      setActionError(firstGeneral(errs));
    }
  };

  const submitRepublish = async (e) => {
    e.preventDefault();
    setRepublishErr(null);
    const parsed = republishSchema.safeParse({ reason: republishReason });
    if (!parsed.success) {
      setRepublishErr(parsed.error.issues[0].message);
      return;
    }
    try {
      await serviceService.requestRepublish(republishOpen.uuid, parsed.data.reason);
      setRepublishOpen(null);
      setRepublishReason('');
      window.location.reload();
    } catch (err) {
      const errs = extractErrors(err);
      setRepublishErr(firstGeneral(errs));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My services</h1>
            <p className="text-slate-500 text-sm mt-1">
              Create and manage your travel services.
            </p>
          </div>
          <Button onClick={handleCreate} loading={create.isPending}>
            <Plus className="w-4 h-4" />
            Create service
          </Button>
        </div>

        {actionError && <Alert variant="error">{actionError}</Alert>}
        {error && <Alert variant="error">Could not load services.</Alert>}

        <div className="flex flex-wrap gap-3 mb-4 mt-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {STATUSES.map((f) => (
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

        {isLoading ? (
          <FullPageLoader label="Loading services…" />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500 mb-4">
              {search || status
                ? 'No services match your filters.'
                : "You haven't created any services yet."}
            </p>
            {!search && !status && (
              <Button onClick={handleCreate} loading={create.isPending}>
                <Plus className="w-4 h-4" />
                Create your first service
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((s) => (
              <div
                key={s.uuid}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  {s.cover_image_url ? (
                    <img
                      src={s.cover_image_url}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                      No cover
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={s.status} />
                    <p className="text-sm font-extrabold text-slate-900">
                      USD {Number(s.price).toLocaleString()}
                    </p>
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mt-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {s.category}
                    {s.subcategory ? ` · ${s.subcategory}` : ''}
                  </p>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    {['DRAFT', 'REJECTED'].includes(s.status) && (
                      <Link
                        to={`/services/mine/${s.uuid}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    )}
                    {s.status === 'PUBLISHED' && (
                      <Link
                        to={`/services/${s.uuid}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    )}
                    {s.status === 'UNPUBLISHED' && (
                      <button
                        onClick={() => setRepublishOpen(s)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        <FileWarning className="w-4 h-4" />
                        Request republish
                      </button>
                    )}
                    {s.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleDelete(s.uuid)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <p className="text-xs text-slate-500 mt-4">
            Page {meta.current_page} of {meta.last_page}
          </p>
        )}
      </main>

      {republishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Request republish</h2>
            <p className="text-sm text-slate-500 mb-4">
              Explain why this service should be brought back. An admin will review.
            </p>
            <form onSubmit={submitRepublish} className="space-y-3">
              <textarea
                rows={4}
                value={republishReason}
                onChange={(e) => setRepublishReason(e.target.value)}
                placeholder="Explain why this service should be republished…"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 ${
                  republishErr
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {republishErr && (
                <p className="text-xs text-rose-600">{republishErr}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setRepublishOpen(null);
                    setRepublishReason('');
                    setRepublishErr(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-sky-50 text-sky-700 border-sky-200',
    PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    UNPUBLISHED: 'bg-amber-50 text-amber-700 border-amber-200',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${map[status] || map.DRAFT}`}
    >
      {String(status || '').replace('_', ' ')}
    </span>
  );
}
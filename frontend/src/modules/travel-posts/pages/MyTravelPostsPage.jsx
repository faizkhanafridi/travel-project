import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, XCircle } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import TravelPostStatusBadge from '../components/TravelPostStatusBadge';
import CreateGlobalPostModal from '../components/CreateGlobalPostModal';
import { useMyTravelPosts, useCancelPost } from '../hooks/useTravelPost';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';

export default function MyTravelPostsPage() {
    const user = useAuthStore((s) => s.user);
if (!user?.is_customer || user?.is_agent || user?.is_super_admin) {
  return <Navigate to="/travel-posts" replace />;
}
  const [type, setType] = useState('');
  const { data, isLoading, error, refetch } = useMyTravelPosts({ type });
  const cancel = useCancelPost();
  const [createOpen, setCreateOpen] = useState(false);
  const [banner, setBanner] = useState(null);

  const posts = data?.data || [];

  const handleCancel = async (uuid) => {
    if (!window.confirm('Delete this post?')) return;
    setBanner(null);
    try {
      await cancel.mutateAsync(uuid);
      refetch();
    } catch (err) {
      setBanner(err?.response?.data?.message || 'Could not Delete.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My travel posts</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your posted trips and review offers.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Post a custom trip
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { value: '', label: 'All' },
            { value: 'global', label: 'Global posts' },
            { value: 'service_request', label: 'Service requests' },
          ].map((f) => (
            <button
              key={f.value || 'all'}
              onClick={() => setType(f.value)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                type === f.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {banner && <Alert variant="error">{banner}</Alert>}
        {error && <Alert variant="error">Could not load posts.</Alert>}

        {isLoading ? (
          <FullPageLoader label="Loading…" />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">You haven't posted any trips yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.uuid}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TravelPostStatusBadge status={p.status} />
                    <span className="text-xs text-slate-500">
                      {p.type === 'global' ? 'Global' : 'Service request'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.destination_city}, {p.destination_country} · {p.duration}{' '}
                    {p.duration_unit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === 'OPEN' && (
                    <button
                      onClick={() => handleCancel(p.uuid)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <XCircle className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                  <Link
                    to={`/travel-posts/${p.uuid}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    View
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {createOpen && (
        <CreateGlobalPostModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
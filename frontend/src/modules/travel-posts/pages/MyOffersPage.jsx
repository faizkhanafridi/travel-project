import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import OfferCard from '../components/OfferCard';
import { useMyOffers, useWithdrawOffer, useConnectBalance } from '../hooks/useTravelPost';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export default function MyOffersPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading, error, refetch } = useMyOffers({ status });
  const withdraw = useWithdrawOffer();
  const balanceQ = useConnectBalance();
  const [pendingAction, setPendingAction] = useState(null);
  const [banner, setBanner] = useState(null);

  const offers = data?.data || [];
  const balance = balanceQ.data?.balance ?? 0;

  const handleWithdraw = async (uuid) => {
    if (!window.confirm('Withdraw this offer?')) return;
    setBanner(null);
    setPendingAction(`withdraw-${uuid}`);
    try {
      await withdraw.mutateAsync(uuid);
      refetch();
    } catch (err) {
      setBanner(err?.response?.data?.message || 'Could not withdraw.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My offers</h1>
            <p className="text-slate-500 text-sm mt-1">
              Offers you've submitted on travel posts.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
            <span className="text-slate-500">Connects:</span>{' '}
            <strong className="text-slate-900">{balance}</strong>{' '}
            <Link
              to="/connects"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 ml-2"
            >
              Buy more →
            </Link>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
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

        {banner && <Alert variant="error">{banner}</Alert>}
        {error && <Alert variant="error">Could not load offers.</Alert>}

        {isLoading ? (
          <FullPageLoader label="Loading…" />
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">No offers yet.</p>
            <Link
              to="/travel-posts"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-3"
            >
              Browse travel posts <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((o) => (
              <div key={o.uuid}>
                {o.post && (
                  <Link
                    to={`/travel-posts/${o.post.uuid}`}
                    className="block mb-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    On: {o.post.title} →
                  </Link>
                )}
                <OfferCard
                  offer={o}
                  viewerRole="agent"
                  onWithdraw={handleWithdraw}
                  pendingAction={pendingAction}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
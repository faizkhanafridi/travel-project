import { useState } from 'react';
import { Check, Package } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import { useConnectPackages, useConnectBalance, useBuyConnects } from '../hooks/useTravelPost';

export default function ConnectsPage() {
  const { data, isLoading } = useConnectPackages();
  const balanceQ = useConnectBalance();
  const buy = useBuyConnects();
  const [selected, setSelected] = useState(null);
  const [banner, setBanner] = useState(null);

  const packages = data?.data || [];
  const balance = balanceQ.data?.balance ?? 0;

  const handleContinue = async () => {
    if (!selected) return;
    setBanner(null);
    try {
      await buy.mutateAsync({ package_uuid: selected });
      // Backend returns 200 with message "Module Finance Coming Soon"
    } catch (err) {
      setBanner(err?.response?.data?.message || 'Could not continue.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Connects</h1>
          <p className="text-slate-500 text-sm mt-1">
            Buy connects to submit offers on global travel posts.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Available connects</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{balance}</p>
            </div>
            <Package className="w-10 h-10 text-brand-500" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-3">Buy connects</h2>

        {isLoading ? (
          <FullPageLoader label="Loading packages…" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {packages.map((p) => (
              <button
                key={p.uuid}
                type="button"
                onClick={() => setSelected(p.uuid)}
                className={`text-left rounded-2xl border p-5 transition ${
                  selected === p.uuid
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:border-brand-300'
                }`}
              >
                <p className="text-sm text-slate-500">Get</p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {p.connects} connects
                </p>
                <p className="text-sm font-semibold text-brand-700 mt-1">
                  ${Number(p.price_usd).toFixed(2)}
                </p>
                {selected === p.uuid && (
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 mt-2">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {banner && <Alert variant="error">{banner}</Alert>}

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selected}
            loading={buy.isPending}
            size="lg"
          >
            Continue to payment
          </Button>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">
          Module 10 — Finance coming soon. Connects will be credited after payment.
        </p>
      </main>
    </div>
  );
}
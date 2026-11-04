import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import TravelPostCard from '../components/TravelPostCard';
import PostFiltersBar from '../components/PostFiltersBar';
import CreateGlobalPostModal from '../components/CreateGlobalPostModal';
import { useGlobalPosts } from '../hooks/useTravelPost';
import { useAuthStore } from '../../../stores/authStore';

function useDebounced(v, ms = 400) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setX(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return x;
}

export default function GlobalPostsPage() {
  const user = useAuthStore((s) => s.user);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const debouncedQ = useDebounced(q);

  const params = {
    q: debouncedQ,
    destination_country: country,
    destination_city: city,
    budget_min: budgetMin,
    budget_max: budgetMax,
  };
  const { data, isLoading, error } = useGlobalPosts(params);
  const posts = data?.data || [];
  const meta = data?.meta;

  const hasFilters = country || city || budgetMin || budgetMax;
const canCreate = !!user?.is_customer && !user?.is_agent && !user?.is_super_admin;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Travel posts</h1>
            <p className="text-slate-500 text-sm mt-1">
              Browse open trip requests from customers. Agents can submit offers.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Post a custom trip
            </Button>
          )}
        </div>

        <PostFiltersBar
          q={q}
          onQChange={setQ}
          country={country}
          onCountryChange={setCountry}
          city={city}
          onCityChange={setCity}
          budgetMin={budgetMin}
          onBudgetMinChange={setBudgetMin}
          budgetMax={budgetMax}
          onBudgetMaxChange={setBudgetMax}
          hasFilters={hasFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          onClear={() => {
            setCountry('');
            setCity('');
            setBudgetMin('');
            setBudgetMax('');
          }}
        />

        {error && <Alert variant="error">Could not load travel posts.</Alert>}

        {isLoading ? (
          <FullPageLoader label="Loading posts…" />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">No open travel posts right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <TravelPostCard key={p.uuid} post={p} />
            ))}
          </div>
        )}
      </main>

      {createOpen && (
        <CreateGlobalPostModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
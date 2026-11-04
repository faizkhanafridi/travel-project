import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Alert from '../../../components/ui/Alert';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import TravelPostStatusBadge from '../components/TravelPostStatusBadge';
import { useAgentServiceRequests } from '../hooks/useTravelPost';

export default function AgentServiceRequestsPage() {
  const { data, isLoading, error } = useAgentServiceRequests({});
  const posts = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Service trip requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Private custom requests from customers who want to book your services.
          </p>
        </div>

        {error && <Alert variant="error">Could not load requests.</Alert>}

        {isLoading ? (
          <FullPageLoader label="Loading…" />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              No service trip requests yet. Customers can request a custom trip from any of
              your published services.
            </p>
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
                    {p.travelers_total && (
                      <span className="text-xs text-slate-500">
                        {p.travelers_total} traveler{p.travelers_total > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.destination_city}, {p.destination_country} · {p.duration}{' '}
                    {p.duration_unit}
                  </p>
                </div>
                <Link
                  to={`/travel-posts/${p.uuid}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  View
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
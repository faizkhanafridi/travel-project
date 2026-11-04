import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, DollarSign, Calendar } from 'lucide-react';
import TravelPostStatusBadge from './TravelPostStatusBadge';

export default function TravelPostCard({ post }) {
  const budget =
    post.budget_min || post.budget_max
      ? `USD ${Number(post.budget_min || 0).toLocaleString()} – ${Number(
          post.budget_max || 0
        ).toLocaleString()}`
      : 'Budget flexible';

  return (
    <Link
      to={`/travel-posts/${post.uuid}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {post.category}
            {post.subcategory ? ` · ${post.subcategory}` : ''}
          </p>
          <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2">
            {post.title}
          </h3>
        </div>
        <TravelPostStatusBadge status={post.status} />
      </div>

      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
        {post.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {post.destination_city}, {post.destination_country}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {post.duration} {post.duration_unit}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {post.travelers_total} traveler{post.travelers_total > 1 ? 's' : ''}
        </span>
        {post.travel_date && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.travel_date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
          <DollarSign className="w-4 h-4 text-slate-400" />
          {budget}
        </span>
        {post.offers_count !== undefined && (
          <span className="text-xs font-semibold text-brand-700">
            {post.offers_count} offer{post.offers_count === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </Link>
  );
}
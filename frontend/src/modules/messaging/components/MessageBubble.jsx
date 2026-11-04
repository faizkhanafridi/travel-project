import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, DollarSign, Users, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

export default function MessageBubble({ message }) {
  if (message.type === 'system' && message.meta?.kind) {
    return <SystemMessageCard message={message} />;
  }

  const me = useAuthStore((s) => s.user);
  const mine = message.sender?.id === me?.id;

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          mine
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-bl-md'
        }`}
      >
        {!mine && message.sender?.name && (
          <p className="text-[11px] font-semibold mb-0.5 opacity-70">
            {message.sender.name}
          </p>
        )}
        <p>{message.body}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            mine ? 'text-white/70' : 'text-slate-500'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

/* ---------------- System message cards ---------------- */

function SystemMessageCard({ message }) {
  const meta = message.meta || {};

  if (meta.kind === 'service_trip_request') {
    return <TripRequestCard message={message} meta={meta} />;
  }
  if (meta.kind === 'travel_offer_submitted') {
    return <OfferSubmittedCard message={message} meta={meta} />;
  }
  if (meta.kind === 'travel_offer_accept') {
    return <OfferAcceptedCard message={message} meta={meta} />;
  }
  if (meta.kind === 'travel_offer_reject') {
    return <OfferRejectedCard message={message} meta={meta} />;
  }

  // Fallback: render as a plain centered system line
  return (
    <div className="flex justify-center my-1">
      <div className="rounded-full bg-slate-100 text-slate-500 text-xs font-medium px-3 py-1">
        {message.body}
      </div>
    </div>
  );
}

function TripRequestCard({ message, meta }) {
  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[85%] rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Private trip request
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-900">
          {meta.travel_post_title || meta.title || 'Custom trip request'}
        </p>
        {meta.service_uuid && (
          <p className="text-xs text-brand-700 mt-0.5">
            About service: {meta.service_title || meta.service_uuid}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
          {meta.preferred_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(meta.preferred_date).toLocaleDateString()}
            </span>
          )}
          {meta.travelers?.total !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {meta.travelers.total} traveler
              {meta.travelers.total > 1 ? 's' : ''}
            </span>
          )}
          {meta.budget && (meta.budget.min || meta.budget.max) && (
            <span className="inline-flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {`${meta.budget.currency || 'USD'} ${Number(
                meta.budget.min || 0
              ).toLocaleString()} – ${Number(meta.budget.max || 0).toLocaleString()}`}
            </span>
          )}
        </div>

        <Link
          to={`/travel-posts/${meta.travel_post_uuid}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-700"
        >
          View request <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function OfferSubmittedCard({ message, meta }) {
  return (
    <div className="flex justify-center my-1">
      <div className="w-full max-w-[85%] rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            New offer submitted
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-900">{message.body}</p>
        {meta.amount !== undefined && (
          <p className="text-sm font-bold text-brand-700 mt-1">
            {meta.currency || 'USD'} {Number(meta.amount).toLocaleString()}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={`/travel-posts/${meta.travel_post_uuid}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-700"
          >
            View offer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function OfferAcceptedCard({ message, meta }) {
  return (
    <div className="flex justify-center my-1">
      <div className="w-full max-w-[85%] rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Offer accepted
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-900">{message.body}</p>
        {meta.amount !== undefined && (
          <p className="text-sm font-bold text-emerald-800 mt-1">
            {meta.currency || 'USD'} {Number(meta.amount).toLocaleString()}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={`/travel-posts/${meta.travel_post_uuid}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700"
          >
            Proceed to booking <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-[11px] text-emerald-700 mt-2">
          Payment & escrow coming soon (Module 10 — Finance)
        </p>
      </div>
    </div>
  );
}

function OfferRejectedCard({ message, meta }) {
  return (
    <div className="flex justify-center my-1">
      <div className="w-full max-w-[85%] rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="w-4 h-4 text-rose-700" />
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
            Offer rejected
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-900">{message.body}</p>
        <Link
          to={`/travel-posts/${meta.travel_post_uuid}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 text-rose-700 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
        >
          View post <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
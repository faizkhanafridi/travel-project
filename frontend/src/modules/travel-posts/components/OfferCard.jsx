import { CheckCircle2, Clock, MapPin, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function OfferCard({ offer, viewerRole, onDecision, onWithdraw, pendingAction }) {
  const agent = offer.agent || {};
  const isCustomer = viewerRole === 'customer';
  const isAgentViewer = viewerRole === 'agent';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">
              {agent.agency_name || agent.owner_name || 'Agent'}
            </span>
            {agent.owner_name && agent.agency_name && (
              <span className="text-xs text-slate-500">· {agent.owner_name}</span>
            )}
          </div>
          {(agent.city || agent.country) && (
            <p className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {[agent.city, agent.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <p className="text-lg font-extrabold text-slate-900">
          USD {Number(offer.amount).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {offer.duration} {offer.duration_unit}
        </span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {offer.status}
        </span>
      </div>

      <p className="text-sm text-slate-700 mt-3 whitespace-pre-line leading-relaxed">
        {offer.message}
      </p>

      {offer.inclusions?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Inclusions
          </p>
          <div className="flex flex-wrap gap-2">
            {offer.inclusions.map((i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-2.5 py-0.5"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {offer.itinerary && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Itinerary
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{offer.itinerary}</p>
        </div>
      )}

      {offer.requirements?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Customer requirements
          </p>
          <ul className="text-sm text-slate-700 space-y-0.5">
            {offer.requirements.map((r) => (
              <li key={r.uuid}>
                • {r.title} <span className="text-xs text-slate-500 capitalize">({r.answer_type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(isCustomer || isAgentViewer) && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          {isCustomer && ['PENDING', 'SHORTLISTED'].includes(offer.status) && (
            <>
              <Button
                type="button"
                onClick={() => onDecision?.(offer.uuid, 'accept')}
                loading={pendingAction === `accept-${offer.uuid}`}
                disabled={pendingAction && pendingAction !== `accept-${offer.uuid}`}
              >
                Accept offer
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onDecision?.(offer.uuid, 'shortlist')}
                loading={pendingAction === `shortlist-${offer.uuid}`}
                disabled={pendingAction && pendingAction !== `shortlist-${offer.uuid}`}
              >
                Shortlist
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => onDecision?.(offer.uuid, 'reject')}
                loading={pendingAction === `reject-${offer.uuid}`}
                disabled={pendingAction && pendingAction !== `reject-${offer.uuid}`}
              >
                Reject
              </Button>
            </>
          )}

          {isAgentViewer && ['PENDING', 'SHORTLISTED'].includes(offer.status) && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onWithdraw?.(offer.uuid)}
              loading={pendingAction === `withdraw-${offer.uuid}`}
              disabled={pendingAction && pendingAction !== `withdraw-${offer.uuid}`}
            >
              Withdraw offer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
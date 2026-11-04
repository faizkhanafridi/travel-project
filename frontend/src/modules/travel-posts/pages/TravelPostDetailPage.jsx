import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Send,
} from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import FullPageLoader from "../../../components/ui/FullPageLoader";
import TravelPostStatusBadge from "../components/TravelPostStatusBadge";
import SubmitOfferModal from "../components/SubmitOfferModal";
import OfferCard from "../components/OfferCard";
import {
  useTravelPost,
  usePostOffers,
  useDecideOffer,
  useConnectBalance,
  useMyOffers,
} from "../hooks/useTravelPost";
import { useAuthStore } from "../../../stores/authStore";

export default function TravelPostDetailPage() {
  const { uuid } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch } = useTravelPost(uuid);
  const post = data?.data;

  const isCustomerOwner = user?.is_customer && post?.customer?.uuid === user?.uuid;
  const isAgent = !!user?.is_agent;
  const isAdmin = !!user?.is_super_admin;
  const canOffer = isAgent && post?.status === "OPEN";
  const offerCost = post?.type === "global" ? 6 : 0;

  const offersQ = usePostOffers(isCustomerOwner ? uuid : null);
  const offers = offersQ.data?.data || [];

  const balanceQ = useConnectBalance();
  const balance = balanceQ.data?.balance ?? 0;

  const decide = useDecideOffer();
  const [pendingAction, setPendingAction] = useState(null);
  const [offerModal, setOfferModal] = useState(false);
  const [actionBanner, setActionBanner] = useState(null);

  const myOffersQ = useMyOffers({});
  const myOffers = myOffersQ.data?.data || [];

  const existingOffer = isAgent
    ? myOffers.find(
        (o) =>
          o.post?.uuid === post?.uuid &&
          ["PENDING", "SHORTLISTED", "ACCEPTED"].includes(o.status),
      )
    : null;

  const alreadyOffered = !!existingOffer;
  const handleDecision = async (offerUuid, decision) => {
    setActionBanner(null);
    setPendingAction(`${decision}-${offerUuid}`);
    try {
      await decide.mutateAsync({ uuid: offerUuid, decision });
      await refetch();
      offersQ.refetch();
    } catch (err) {
      setActionBanner(
        err?.response?.data?.message || "Could not process decision.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Loading post…" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">Travel post not found.</p>
          <Link
            to="/travel-posts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to posts
          </Link>
        </div>
      </div>
    );
  }

  const budget =
    post.budget.min || post.budget.max
      ? `USD ${Number(post.budget.min || 0).toLocaleString()} – ${Number(
          post.budget.max || 0,
        ).toLocaleString()}`
      : "Flexible";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/travel-posts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to posts
        </Link>

        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-xs text-slate-500">
                    {post.category?.name}
                    {post.subcategory?.name
                      ? ` · ${post.subcategory.name}`
                      : ""}
                  </p>
                  <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {post.title}
                  </h1>
                </div>
                <TravelPostStatusBadge status={post.status} />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
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
                  {post.travelers.total} ({post.travelers.adults} adults,{" "}
                  {post.travelers.children} children)
                </span>
                {post.travel_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.travel_date).toLocaleDateString()}
                  </span>
                )}
                {post.preferred_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Preferred:{" "}
                    {new Date(post.preferred_date).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 whitespace-pre-line mt-4">
                {post.description}
              </p>

              {post.services_needed?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Services needed
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.services_needed.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-2.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {post.additional_requirements && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Additional requirements
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {post.additional_requirements}
                  </p>
                </div>
              )}
            </div>

            {isCustomerOwner && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-semibold text-slate-900 mb-3">
                  Offers ({offers.length})
                </h2>
                {actionBanner && <Alert variant="error">{actionBanner}</Alert>}
                {offersQ.isLoading ? (
                  <p className="text-sm text-slate-500">Loading offers…</p>
                ) : offers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No offers yet. Agents will be notified.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {offers.map((o) => (
                      <OfferCard
                        key={o.uuid}
                        offer={o}
                        viewerRole="customer"
                        onDecision={handleDecision}
                        pendingAction={pendingAction}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Budget</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-slate-400" />
                {budget}
              </p>

              {isAgent && balanceQ.isSuccess && (
                <p className="text-xs text-slate-500 mt-2">
                  Your connects:{" "}
                  <strong className="text-slate-800">{balance}</strong>
                </p>
              )}

              {canOffer && !alreadyOffered ? (
                <button
                  type="button"
                  onClick={() => setOfferModal(true)}
                  className="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-brand-600 text-white py-3 font-semibold hover:bg-brand-700"
                >
                  <Send className="w-4 h-4" />
                  Submit an offer{" "}
                  {offerCost > 0 ? `(${offerCost} connects)` : ""}
                </button>
              ) : canOffer && alreadyOffered ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm font-semibold text-emerald-800">
                    You already submitted an offer
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5 capitalize">
                    Status: {existingOffer.status.toLowerCase()}
                  </p>
                  <Link
                    to="/my-offers"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900 mt-2"
                  >
                    View my offer →
                  </Link>
                </div>
              ) : isCustomerOwner ? (
                <p className="mt-4 text-sm text-slate-500">
                  You posted this trip. Offers appear on the left as agents
                  respond.
                </p>
              ) : !isAgent && !isAdmin ? (
                <p className="mt-4 text-sm text-slate-500">
                  Only approved agents can submit offers on travel posts.
                </p>
              ) : null}

              {post.customer && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Posted by</p>
                  <Link
                    to={`/u/${post.customer?.profile_uuid}`}
                    className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    {post.customer.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {offerModal && (
        <SubmitOfferModal
          post={post}
          offerCost={offerCost}
          onClose={() => setOfferModal(false)}
          onSubmitted={() => {
            setOfferModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

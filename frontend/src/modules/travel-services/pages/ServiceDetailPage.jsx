import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Tag,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import FullPageLoader from "../../../components/ui/FullPageLoader";
import Alert from "../../../components/ui/Alert";
import { usePublicService } from "../hooks/useService";
import { useAuthStore } from "../../../stores/authStore";
import { useStartConversation } from "../../messaging/hooks/useMessaging";
import { useNavigate } from "react-router-dom";
import RequestTripModal from "../../travel-posts/components/RequestTripModal";
import { useState } from "react";

export default function ServiceDetailPage() {
  const { uuid } = useParams();
  const { data, isLoading, error } = usePublicService(uuid);
  const s = data?.data;
  const navigate = useNavigate();
  const start = useStartConversation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = !!user?.is_super_admin;
  const isOwnerAgent =
    !!user?.is_agent && !!s?.agent && user?.agent_uuid === s.agent.uuid;
  console.log(isOwnerAgent);
  const [requestTripOpen, setRequestTripOpen] = useState(false);
  const messageAgent = async () => {
    if (!s?.agent?.uuid) return;
    try {
      const result = await start.mutateAsync({
        agent_uuid: s.agent.uuid,
        service_uuid: s.uuid,
      });
      const convUuid = result.data.uuid;
      navigate(`/messages?c=${convUuid}`);
    } catch {
      // error banner optional
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <FullPageLoader label="Loading service…" />
      </div>
    );
  }

  if (error || !s) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">Service not found.</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const cover = s.images?.find((i) => i.is_cover) || s.images?.[0];
  const priceText =
    s.converted_currency && s.converted_price !== undefined
      ? `${s.converted_currency} ${Number(s.converted_price).toLocaleString()}`
      : `USD ${Number(s.price).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[16/10]">
              {cover ? (
                <img
                  src={cover.url}
                  alt={s.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No image
                </div>
              )}
            </div>

            {s.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {s.images.map((img) => (
                  <div
                    key={img.uuid}
                    className="rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {s.title}
              </h1>
              {s.agent && (
                <Link
                  to={`/agency/${s.agent.uuid}`}
                  className="text-sm font-semibold text-brand-700 hover:text-brand-800 mt-1 inline-block"
                >
                  {s.agent.agency_name} · {s.agent.city}, {s.agent.country}
                </Link>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {s.destination_city}, {s.destination_country}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {s.duration} {s.duration_unit}
                </span>
                {s.category && (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {s.category.name}
                    {s.subcategory ? ` · ${s.subcategory.name}` : ""}
                  </span>
                )}
              </div>

              {s.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {s.full_description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    About this service
                  </h2>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                    {s.full_description}
                  </p>
                </div>
              )}

              {s.inclusions?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    What's included
                  </h2>
                  <ul className="space-y-1.5">
                    {s.inclusions.map((i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.requirements?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    Requirements (collected at booking)
                  </h2>
                  <ul className="space-y-2">
                    {s.requirements.map((r) => (
                      <li key={r.uuid} className="text-sm text-slate-700">
                        <p className="font-semibold">{r.title}</p>
                        {r.description && (
                          <p className="text-xs text-slate-500">
                            {r.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.cancellation_policy && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    Cancellation policy
                  </h2>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {s.cancellation_policy}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Starting at</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {priceText}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Base currency USD · final price may vary by extras
              </p>

              {isAdmin ? (
                <Link
                  to={`/admin/services/${s.uuid}`}
                  className="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800"
                >
                  Review in admin
                </Link>
              ) : isOwnerAgent ? (
                <Link
                  to={`/services/mine/${s.uuid}`}
                  className="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-brand-600 text-white py-3 font-semibold hover:bg-brand-700"
                >
                  Edit this service
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-xl bg-brand-600 text-white py-3 font-semibold hover:bg-brand-700"
                  >
                    Book this service
                  </button>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Payment coming soon (Module 10 — Finance)
                  </p>

                  {!isAdmin && !isOwnerAgent && s.agent && (
                    <>
                      <button
                        type="button"
                        onClick={messageAgent}
                        disabled={start.isPending}
                        className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message this agent
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestTripOpen(true)}
                        className="mt-2 w-full inline-flex justify-center items-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Request custom trip
                      </button>
                    </>
                  )}
                </>
              )}  
            </div>
          </div>
        </div>
      </main>

      {requestTripOpen && (
        <RequestTripModal
          service={s}
          onClose={() => setRequestTripOpen(false)}
          onCreated={(post) => {
            setRequestTripOpen(false);
            navigate(`/travel-posts/${post.uuid}`);
          }}
        />
      )}
    </div>
  );
}

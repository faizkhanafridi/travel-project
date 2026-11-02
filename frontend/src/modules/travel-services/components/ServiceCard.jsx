import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import { serviceService } from '../services/serviceService';

export default function ServiceCard({ service }) {
  const cover = service.cover_image_url;
  const price =
    service.converted_price !== undefined
      ? `${service.converted_currency} ${Number(service.converted_price).toLocaleString()}`
      : `USD ${Number(service.price).toLocaleString()}`;

  return (
    <Link
      to={`/services/${service.uuid}`}
      className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
    >
      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
            No image
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <span className="font-semibold text-slate-800 truncate">
            {service.agency_name || 'Travel Agency'}
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-700">
          {service.title}
        </h3>

        {service.short_description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {service.short_description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
          {service.destination_city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {service.destination_city}
              {service.destination_country && `, ${service.destination_country}`}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {service.duration} {service.duration_unit}
          </span>
        </div>

        <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Starting at</p>
            <p className="text-lg font-extrabold text-slate-900">{price}</p>
          </div>
          <div className="text-right">
            {service.rating != null ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {service.rating}
                <span className="text-slate-500 font-normal">({service.reviews_count})</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">Ratings coming soon</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
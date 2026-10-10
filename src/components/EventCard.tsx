import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { EventObj } from '@/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function EventCard({ event }: { event: EventObj }) {
  const typeBadge = {
    'on-ground': { label: 'On-Ground', class: 'bg-amber-100 text-amber-700' },
    virtual: { label: 'Virtual', class: 'bg-teal-100 text-teal-700' },
    both: { label: 'On-Ground + Virtual', class: 'bg-ink-100 text-ink-700' },
  };

  const statusBadge = {
    open: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    closed: 'bg-red-100 text-red-700',
    completed: 'bg-ink-100 text-ink-500',
  };

  return (
    <Link
      to={`/events/${event.slug}`}
      className="card group overflow-hidden hover:shadow-card-hover hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.banner_image}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${typeBadge[event.event_type].class}`}>
            {typeBadge[event.event_type].label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`badge ${statusBadge[event.status]} capitalize`}>
            {event.status}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-bold text-lg leading-tight">{event.name}</h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4 text-sm text-ink-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-amber-500" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-amber-500" />
            {event.city}
          </span>
        </div>

        <p className="text-sm text-ink-600 line-clamp-2 mb-4">{event.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-700">
            {event.categories?.length || 0} Categories
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:gap-2 transition-all">
            View Details <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

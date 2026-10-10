import { useState, useMemo } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useEvents } from '@/lib/queries';
import { EventCard } from '@/components/EventCard';

export default function Events() {
  const { events, loading } = useEvents();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');

  const cities = useMemo(() => {
    const set = new Set(events.map(e => e.city));
    return ['all', ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    let result = events.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === 'all' || e.city === cityFilter;
      const matchesType = typeFilter === 'all' || e.event_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesCity && matchesType && matchesStatus;
    });

    result = result.sort((a, b) => {
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [events, search, cityFilter, typeFilter, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-ink-950 py-16">
        <div className="container-max">
          <span className="eyebrow text-amber-400 mb-3"><Filter className="h-4 w-4" /> Browse Events</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">Upcoming Events</h1>
          <p className="mt-3 text-lg text-ink-400 max-w-2xl">
            Discover and register for running events, marathons, night runs, and virtual races across India.
          </p>
        </div>
      </div>

      <div className="container-max py-10">
        {/* Filters */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input-field">
                <option value="all">All Cities</option>
                {cities.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field">
                <option value="all">All Types</option>
                <option value="on-ground">On-Ground</option>
                <option value="virtual">Virtual</option>
                <option value="both">Both</option>
              </select>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>

              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field">
                <option value="date-asc">Date (Earliest)</option>
                <option value="date-desc">Date (Latest)</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ink-500">
            Showing <span className="font-semibold text-ink-700">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-96 animate-pulse bg-ink-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <SlidersHorizontal className="h-12 w-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500 font-medium">No events match your filters</p>
            <button
              onClick={() => { setSearch(''); setCityFilter('all'); setTypeFilter('all'); setStatusFilter('all'); }}
              className="btn-ghost mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

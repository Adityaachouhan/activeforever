import { useEffect, useState, type ChangeEvent } from 'react';
import { Plus, Trash2, Edit3, X, Save, CalendarDays, Tag, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { EventObj, EventCategory } from '@/types';

export default function AdminEvents() {
  const [events, setEvents] = useState<EventObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventObj | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data: eventsData } = await api.from('events').select('*').order('date', { ascending: true });
    if (!eventsData) { setLoading(false); return; }
    const eventsWithCats = await Promise.all(
      eventsData.map(async (e: any) => {
        const { data: cats } = await api.from('event_categories').select('*').eq('event_id', e.id).order('sort_order', { ascending: true });
        return { ...e, categories: cats || [] };
      })
    );
    setEvents(eventsWithCats);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (event: any, categories: any[]) => {
    if (editing) {
      await api.from('events').update(event).eq('id', editing.id);
      // Update categories: delete old and insert new
      await api.from('event_categories').delete().eq('event_id', editing.id);
      if (categories.length > 0) {
        await api.from('event_categories').insert(categories.map(c => ({ ...c, event_id: editing.id, id: undefined })));
      }
    } else {
      const { data: newEvent } = await api.from('events').insert(event).select('*').maybeSingle();
      if (newEvent && categories.length > 0) {
        await api.from('event_categories').insert(categories.map(c => ({ ...c, event_id: newEvent.id })));
      }
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event and all its categories?')) return;
    await api.from('events').delete().eq('id', id);
    load();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">Event Management</h1>
          <p className="text-ink-500 text-sm mt-1">Create and manage events</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event.id} className="card overflow-hidden">
              <img src={event.banner_image} alt={event.name} className="h-40 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-bold text-ink-900">{event.name}</h3>
                  <span className={`badge ${event.status === 'open' ? 'bg-green-100 text-green-700' : event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-ink-100 text-ink-500'}`}>{event.status}</span>
                </div>
                <p className="text-sm text-ink-500 mb-3">{event.city} · {new Date(event.date).toLocaleDateString('en-IN')}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-ink-600">{event.categories.length} categories</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(event); setShowForm(true); }} className="btn-outline text-sm py-2 flex-1"><Edit3 className="h-4 w-4" /> Edit</button>
                  <button onClick={() => handleDelete(event.id)} className="btn-outline text-sm py-2 text-red-600 border-red-200 hover:border-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EventForm event={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function EventForm({ event, onSave, onClose }: { event: EventObj | null; onSave: (e: any, cats: any[]) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    slug: event?.slug || '',
    name: event?.name || '',
    description: event?.description || '',
    date: event?.date || '',
    end_date: event?.end_date || '',
    city: event?.city || '',
    venue: event?.venue || '',
    state: event?.state || '',
    event_type: event?.event_type || 'on-ground',
    banner_image: event?.banner_image || '',
    status: event?.status || 'upcoming',
    reg_open_date: event?.reg_open_date || '',
    reg_close_date: event?.reg_close_date || '',
  });

  const [categories, setCategories] = useState<any[]>(
    event?.categories?.map(c => ({ ...c, distance_km: String(c.distance_km ?? 0) })) || [{ slug: '', name: '', description: '', distance_km: '0', price_inr: 0, virtual_price_inr: 0, max_participants: 0, sort_order: 0 }]
  );

  const updateCat = (i: number, field: string, value: any) => {
    setCategories(cats => cats.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, banner_image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-ink-900">{event ? 'Edit' : 'Add'} Event</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>

        <form
          id="event-form"
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            if (categories.length === 0) {
              alert('Add at least one race category before saving this event.');
              return;
            }
            onSave(form, categories.map(category => ({
              ...category,
              distance_km: Number.parseFloat(category.distance_km) || 0,
            })));
          }}
        >
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            Fill in the event name, event date, and city. Add at least one race category with a name and URL slug. Fields marked * are required.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Event Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="input-field" placeholder="e.g. Jamshedpur Night Run" />
              <p className="mt-1 text-xs text-ink-400">The event title visitors will see.</p>
            </div>
            <div>
              <label className="label-field">URL Slug *</label>
              <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="e.g. jamshedpur-night-run" />
              <p className="mt-1 text-xs text-ink-400">The event’s web address. Use lowercase letters and hyphens, no spaces.</p>
            </div>
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="A short introduction to the event, route, and who can participate." />
          </div>
          <div>
            <label className="label-field">Upload Banner Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
            <p className="mt-1 text-xs text-ink-400">Optional. This image is shown on event cards and the event page.</p>
          </div>
          {form.banner_image && <img src={form.banner_image} alt="Preview" className="h-24 w-full rounded-xl object-cover" />}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className="label-field">Event Date *</label><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" /></div>
            <div><label className="label-field">End Date</label><input type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} className="input-field" /><p className="mt-1 text-xs text-ink-400">Only if the event lasts more than one day.</p></div>
            <div><label className="label-field">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'upcoming' | 'open' | 'closed' | 'completed' })} className="input-field">
                <option>upcoming</option><option>open</option><option>closed</option><option>completed</option>
              </select>
              <p className="mt-1 text-xs text-ink-400">Choose whether it is upcoming, accepting registrations, closed, or completed.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className="label-field">City *</label><input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="e.g. Jamshedpur" /></div>
            <div><label className="label-field">Venue</label><input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="input-field" placeholder="e.g. Jubilee Park" /></div>
            <div><label className="label-field">State</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field" placeholder="e.g. Jharkhand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">Event Type</label>
              <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value as 'on-ground' | 'virtual' | 'both' })} className="input-field">
                <option value="on-ground">On-Ground</option><option value="virtual">Virtual</option><option value="both">Both</option>
              </select>
              <p className="mt-1 text-xs text-ink-400">On-Ground is in-person; Virtual is remote; Both offers either option.</p>
            </div>
            <div><label className="label-field">Registration Opens</label><input type="date" value={form.reg_open_date || ''} onChange={e => setForm({ ...form, reg_open_date: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="label-field">Registration Closes</label><input type="date" value={form.reg_close_date || ''} onChange={e => setForm({ ...form, reg_close_date: e.target.value })} className="input-field" /></div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="label-field mb-0">Race Categories</label>
                <p className="mt-1 text-xs text-ink-400">Add one row for each race option people can register for, such as 5K or Half Marathon.</p>
              </div>
              <button type="button" onClick={() => setCategories([...categories, { slug: '', name: '', description: '', distance_km: '0', price_inr: 0, virtual_price_inr: 0, max_participants: 0, sort_order: categories.length }])} className="btn-ghost text-sm py-1">
                <PlusIcon className="h-4 w-4" /> Add Category
              </button>
            </div>
            <div className="space-y-3">
              {categories.map((cat, i) => (
                <div key={i} className="rounded-xl border border-ink-100 p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div><label className="mb-1 block text-xs font-semibold text-ink-600">Category name *</label><input required value={cat.name} onChange={e => updateCat(i, 'name', e.target.value)} className="input-field text-sm" placeholder="e.g. Half Marathon" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-ink-600">Category URL slug *</label><input required value={cat.slug} onChange={e => updateCat(i, 'slug', e.target.value)} className="input-field text-sm" placeholder="e.g. half-marathon" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-ink-600">Distance (km)</label><input type="number" min="0" step="0.1" value={cat.distance_km} onChange={e => updateCat(i, 'distance_km', e.target.value)} className="input-field text-sm" placeholder="e.g. 2.5 or 21" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-ink-600">In-person fee (₹)</label><input type="number" min="0" value={cat.price_inr} onChange={e => updateCat(i, 'price_inr', parseInt(e.target.value) || 0)} className="input-field text-sm" placeholder="e.g. 1500" /></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    <div><label className="mb-1 block text-xs font-semibold text-ink-600">Virtual fee (₹)</label><input type="number" min="0" value={cat.virtual_price_inr} onChange={e => updateCat(i, 'virtual_price_inr', parseInt(e.target.value) || 0)} className="input-field text-sm" placeholder="0 if not offered" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-ink-600">Participant limit (optional)</label><input type="number" min="0" value={cat.max_participants} onChange={e => updateCat(i, 'max_participants', parseInt(e.target.value) || 0)} className="input-field text-sm" placeholder="e.g. 500" /><p className="mt-1 text-xs text-ink-400">For reference; it does not currently restrict registrations.</p></div>
                    <div className="col-span-2 flex items-end justify-between gap-2">
                      <p className="text-xs text-ink-400">Enter fees in rupees. Set virtual fee to 0 if this category is not available virtually.</p>
                      <button type="button" onClick={() => setCategories(categories.filter((_, idx) => idx !== i))} className="btn-ghost text-red-600 p-2" aria-label="Remove category"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="mt-2"><label className="mb-1 block text-xs font-semibold text-ink-600">Category description (optional)</label><input value={cat.description || ''} onChange={e => updateCat(i, 'description', e.target.value)} className="input-field text-sm" placeholder="e.g. A scenic 21 km road race" /></div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="flex gap-3 mt-6">
          <button type="submit" form="event-form" className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
          <button onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

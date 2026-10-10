import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, X, Save, MessageSquare, Star } from 'lucide-react';
import { api } from '@/lib/api';
import type { Testimonial } from '@/types';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await api.from('testimonials').select('*').order('sort_order', { ascending: true });
    setTestimonials(data as Testimonial[] || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (t: any) => {
    if (editing) {
      await api.from('testimonials').update(t).eq('id', editing.id);
    } else {
      await api.from('testimonials').insert(t);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await api.from('testimonials').delete().eq('id', id);
    load();
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">Testimonials</h1>
          <p className="text-ink-500 text-sm mt-1">Manage runner testimonials</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(t); setShowForm(true); }} className="btn-ghost p-2"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="btn-ghost p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-4 italic">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">{t.name[0]}</div>
              <div>
                <div className="text-sm font-semibold text-ink-700">{t.name}</div>
                <div className="text-xs text-ink-500">{t.role} · {t.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TestimonialForm testimonial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function TestimonialForm({ testimonial, onSave, onClose }: { testimonial: Testimonial | null; onSave: (t: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: testimonial?.name || '',
    role: testimonial?.role || '',
    city: testimonial?.city || '',
    quote: testimonial?.quote || '',
    rating: testimonial?.rating || 5,
  });
  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-ink-900">{testimonial ? 'Edit' : 'Add'} Testimonial</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-field">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">Role</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field" /></div>
            <div><label className="label-field">City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="label-field">Quote *</label><textarea value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} className="input-field" rows={4} /></div>
          <div><label className="label-field">Rating</label>
            <select value={form.rating} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })} className="input-field">
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
          <button onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

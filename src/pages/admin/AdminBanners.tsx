import { useEffect, useState, type ChangeEvent } from 'react';
import { Plus, Trash2, Edit3, X, Save, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Banner } from '@/types';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await api.from('banners').select('*').order('sort_order', { ascending: true });
    setBanners(data as Banner[] || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (banner: Partial<Banner>) => {
    if (editing) {
      await api.from('banners').update(banner).eq('id', editing.id);
    } else {
      await api.from('banners').insert(banner);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await api.from('banners').delete().eq('id', id);
    load();
  };

  const moveBanner = async (banner: Banner, dir: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === banner.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const swapBanner = banners[swapIdx];
    await Promise.all([
      api.from('banners').update({ sort_order: swapBanner.sort_order }).eq('id', banner.id),
      api.from('banners').update({ sort_order: banner.sort_order }).eq('id', swapBanner.id),
    ]);
    load();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">Banner Management</h1>
          <p className="text-ink-500 text-sm mt-1">Manage homepage hero banners</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : banners.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageIcon className="h-12 w-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">No banners yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="card p-4 flex items-center gap-4">
              <img src={banner.image_url} alt={banner.title} className="h-20 w-32 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink-900 truncate">{banner.title}</h3>
                  <span className={`badge ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-ink-500 truncate">{banner.subtitle}</p>
                <p className="text-xs text-ink-400 mt-1">CTA: {banner.cta_text} → {banner.cta_link}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveBanner(banner, 'up')} className="btn-ghost p-2"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => moveBanner(banner, 'down')} className="btn-ghost p-2"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => { setEditing(banner); setShowForm(true); }} className="btn-ghost p-2"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(banner.id)} className="btn-ghost p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BannerForm
          banner={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function BannerForm({ banner, onSave, onClose }: { banner: Banner | null; onSave: (b: Partial<Banner>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image_url: banner?.image_url || '',
    cta_text: banner?.cta_text || 'Register Now',
    cta_link: banner?.cta_link || '/events',
    sort_order: banner?.sort_order || 0,
    is_active: banner?.is_active ?? true,
  });

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
    reader.onload = () => setForm((prev) => ({ ...prev, image_url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-ink-900">{banner ? 'Edit' : 'Add'} Banner</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-field">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
          <div><label className="label-field">Subtitle</label><textarea value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="input-field" rows={2} /></div>
          <div>
            <label className="label-field">Upload Image *</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
          </div>
          {form.image_url && <img src={form.image_url} alt="Preview" className="h-32 w-full rounded-xl object-cover" />}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">CTA Text</label><input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} className="input-field" /></div>
            <div><label className="label-field">CTA Link</label><input value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">Sort Order</label><input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} className="input-field" /></div>
            <div>
              <label className="label-field">Active</label>
              <select value={form.is_active ? '1' : '0'} onChange={e => setForm({ ...form, is_active: e.target.value === '1' })} className="input-field">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
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

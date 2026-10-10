import { useEffect, useState, type ChangeEvent } from 'react';
import { Plus, Trash2, Edit3, X, Save, Tag, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORY_SUBPAGES, CATEGORY_SUBPAGE_LABELS } from '@/types';
import type { RaceCategoryMicrosite } from '@/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<RaceCategoryMicrosite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<RaceCategoryMicrosite | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await api.from('race_categories').select('*').order('sort_order', { ascending: true });
    setCategories(data as RaceCategoryMicrosite[] || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (cat: any) => {
    if (editing) {
      await api.from('race_categories').update(cat).eq('id', editing.id);
    } else {
      await api.from('race_categories').insert(cat);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this race category and all its content?')) return;
    await api.from('race_categories').delete().eq('id', id);
    load();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">Race Categories</h1>
          <p className="text-ink-500 text-sm mt-1">Manage category microsite pages</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card overflow-hidden">
              <div className="relative h-32">
                <img src={cat.banner_image} alt={cat.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-ink-950/40" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-display font-bold text-white">{cat.name}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-500 mb-3">
                  <Tag className="h-3 w-3" /> {Object.keys(cat.subpages || {}).length}/15 subpages
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(cat); setShowForm(true); }} className="btn-outline text-sm py-2 flex-1"><Edit3 className="h-4 w-4" /> Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="btn-outline text-sm py-2 text-red-600 border-red-200"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm category={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function CategoryForm({ category, onSave, onClose }: { category: RaceCategoryMicrosite | null; onSave: (c: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    slug: category?.slug || '',
    name: category?.name || '',
    banner_image: category?.banner_image || '',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true,
  });
  const [subpages, setSubpages] = useState<Record<string, string>>(
    (category?.subpages as Record<string, string>) || {}
  );
  const [feesTable, setFeesTable] = useState<{ applicant_type: string; fee_inr: number }[]>(
    (category?.fees_table as { applicant_type: string; fee_inr: number }[]) || [{ applicant_type: '', fee_inr: 0 }]
  );
  const [activeSubpage, setActiveSubpage] = useState('registration-dates');

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

  const handleSave = () => {
    onSave({
      ...form,
      subpages,
      fees_table: feesTable,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-ink-900">{category ? 'Edit' : 'Add'} Race Category</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-field">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="input-field" /></div>
            <div><label className="label-field">Slug *</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field" /></div>
          </div>
          <div>
            <label className="label-field">Upload Banner Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
          </div>
          {form.banner_image && <img src={form.banner_image} alt="Preview" className="h-24 w-full rounded-xl object-cover" />}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">Sort Order</label><input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} className="input-field" /></div>
            <div><label className="label-field">Active</label>
              <select value={form.is_active ? '1' : '0'} onChange={e => setForm({ ...form, is_active: e.target.value === '1' })} className="input-field">
                <option value="1">Active</option><option value="0">Inactive</option>
              </select>
            </div>
          </div>

          {/* Subpage Content Editor */}
          <div className="pt-4 border-t border-ink-100">
            <h3 className="font-display font-bold text-ink-900 mb-3">Subpage Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subpage selector */}
              <div className="md:col-span-1">
                <div className="rounded-xl border border-ink-100 max-h-64 overflow-y-auto">
                  {CATEGORY_SUBPAGES.map(sp => (
                    <button
                      key={sp}
                      onClick={() => setActiveSubpage(sp)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left border-b border-ink-50 last:border-0 transition-colors ${
                        activeSubpage === sp ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <span className="truncate">{CATEGORY_SUBPAGE_LABELS[sp]}</span>
                      <ChevronRight className="h-3 w-3 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
              {/* Content editor */}
              <div className="md:col-span-2">
                {activeSubpage === 'application-fees' ? (
                  <div>
                    <label className="label-field">Content</label>
                    <textarea
                      value={subpages[activeSubpage] || ''}
                      onChange={e => setSubpages({ ...subpages, [activeSubpage]: e.target.value })}
                      className="input-field mb-4"
                      rows={4}
                    />
                    <label className="label-field">Fees Table</label>
                    <div className="space-y-2">
                      {feesTable.map((row, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={row.applicant_type} onChange={e => setFeesTable(feesTable.map((r, idx) => idx === i ? { ...r, applicant_type: e.target.value } : r))} className="input-field text-sm flex-1" placeholder="Applicant Type" />
                          <input type="number" value={row.fee_inr} onChange={e => setFeesTable(feesTable.map((r, idx) => idx === i ? { ...r, fee_inr: parseInt(e.target.value) || 0 } : r))} className="input-field text-sm w-28" placeholder="Rs." />
                          <button onClick={() => setFeesTable(feesTable.filter((_, idx) => idx !== i))} className="btn-ghost text-red-600 p-2"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => setFeesTable([...feesTable, { applicant_type: '', fee_inr: 0 }])} className="btn-ghost text-sm py-1">
                        <Plus className="h-4 w-4" /> Add Row
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="label-field">{CATEGORY_SUBPAGE_LABELS[activeSubpage]}</label>
                    <textarea
                      value={subpages[activeSubpage] || ''}
                      onChange={e => setSubpages({ ...subpages, [activeSubpage]: e.target.value })}
                      className="input-field"
                      rows={12}
                      placeholder="Enter content for this section..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
          <button onClick={handleSave} className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
          <button onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

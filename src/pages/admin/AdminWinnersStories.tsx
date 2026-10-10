import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Trophy, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { readImageFile } from '@/lib/image-upload';

interface WinnerRecord {
  id: string;
  name: string;
  category: string;
  year: number;
  time: string;
  city: string;
  rank: number;
  image_url: string;
  quote: string;
  created_at: string;
}

const createEmptyForm = () => ({
  name: '',
  category: '',
  year: new Date().getFullYear(),
  time: '',
  city: '',
  rank: 1,
  image_url: '',
  quote: '',
});

export default function AdminWinnersStories() {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [form, setForm] = useState(createEmptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadWinners = async () => {
    const { data, error: queryError } = await api
      .from('winners_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message || 'Could not load winners.');
    } else {
      setWinners(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWinners();
  }, []);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      const imageUrl = await readImageFile(file);
      setForm((current) => ({ ...current, image_url: imageUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not read the image.');
      event.target.value = '';
    }
  };

  const addWinner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.image_url) {
      setError('Choose a winner image to upload.');
      return;
    }

    setSaving(true);
    setError('');
    const { error: insertError } = await api.from('winners_stories').insert({
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      time: form.time.trim(),
      city: form.city.trim(),
      quote: form.quote.trim(),
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message || 'Could not save the winner.');
      return;
    }

    setForm(createEmptyForm());
    await loadWinners();
  };

  const deleteWinner = async (id: string) => {
    if (!confirm('Delete this winner story?')) return;
    const { error: deleteError } = await api.from('winners_stories').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message || 'Could not delete the winner.');
      return;
    }
    setWinners((current) => current.filter((winner) => winner.id !== id));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-extrabold text-ink-900">Winners Story</h1>
        <p className="text-ink-500 text-sm mt-1">Add winners and their photos to the public Winners Story page.</p>
      </div>

      <form onSubmit={addWinner} className="card p-5 mb-8 space-y-4 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="winner-name">Winner name *</label>
            <input id="winner-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="winner-category">Race category *</label>
            <input id="winner-category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="winner-year">Year</label>
            <input id="winner-year" type="number" min="1900" max="2200" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="winner-rank">Rank</label>
            <select id="winner-rank" value={form.rank} onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })} className="input-field">
              <option value={1}>1st</option>
              <option value={2}>2nd</option>
              <option value={3}>3rd</option>
              <option value={4}>Other</option>
            </select>
          </div>
          <div>
            <label className="label-field" htmlFor="winner-time">Finish time</label>
            <input id="winner-time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input-field" placeholder="e.g. 2:28:14" />
          </div>
          <div>
            <label className="label-field" htmlFor="winner-city">City</label>
            <input id="winner-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label-field" htmlFor="winner-quote">Winner quote</label>
          <textarea id="winner-quote" rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="label-field" htmlFor="winner-image">Winner image *</label>
          <input id="winner-image" type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
          <p className="text-xs text-ink-400 mt-1">Images only, up to 5MB.</p>
        </div>
        {form.image_url && <img src={form.image_url} alt="Winner preview" className="h-48 w-full rounded-xl object-cover" />}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          <ImagePlus className="h-4 w-4" /> {saving ? 'Publishing…' : 'Publish Winner'}
        </button>
      </form>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : winners.length === 0 ? (
        <div className="card p-10 text-center">
          <Trophy className="h-10 w-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">No admin-published winners yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {winners.map((winner) => (
            <article key={winner.id} className="card overflow-hidden">
              <img src={winner.image_url} alt={winner.name} className="h-40 w-full object-cover" />
              <div className="p-4 flex justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink-900">{winner.name}</h2>
                  <p className="text-sm text-ink-500">{winner.category} · {winner.year} · Rank {winner.rank}</p>
                </div>
                <button type="button" onClick={() => deleteWinner(winner.id)} aria-label="Delete winner" className="btn-ghost p-2 text-red-600 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

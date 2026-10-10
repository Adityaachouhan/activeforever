import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { BookOpen, ImagePlus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { readImageFile } from '@/lib/image-upload';

interface EventStoryRecord {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  story_date: string;
  read_time: string;
  image_url: string;
  featured: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  category: '',
  author: 'Active Forever Team',
  story_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  read_time: '5 min read',
  image_url: '',
  featured: false,
};

export default function AdminEventStories() {
  const [stories, setStories] = useState<EventStoryRecord[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadStories = async () => {
    const { data, error: queryError } = await api
      .from('event_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message || 'Could not load event stories.');
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
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

  const addStory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.image_url) {
      setError('Choose a story image to upload.');
      return;
    }

    setSaving(true);
    setError('');
    const { error: insertError } = await api.from('event_stories').insert({
      ...form,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category.trim(),
      author: form.author.trim(),
      story_date: form.story_date.trim(),
      read_time: form.read_time.trim(),
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message || 'Could not save the story.');
      return;
    }

    setForm(EMPTY_FORM);
    await loadStories();
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Delete this event story?')) return;
    const { error: deleteError } = await api.from('event_stories').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message || 'Could not delete the story.');
      return;
    }
    setStories((current) => current.filter((story) => story.id !== id));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-extrabold text-ink-900">Event Stories</h1>
        <p className="text-ink-500 text-sm mt-1">Publish stories with an image to the Event Story page.</p>
      </div>

      <form onSubmit={addStory} className="card p-5 mb-8 space-y-4 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="story-title">Title *</label>
            <input id="story-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="story-category">Category *</label>
            <input id="story-category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="e.g. Night Run" />
          </div>
        </div>
        <div>
          <label className="label-field" htmlFor="story-excerpt">Excerpt *</label>
          <textarea id="story-excerpt" required rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="story-author">Author</label>
            <input id="story-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="story-date">Date</label>
            <input id="story-date" value={form.story_date} onChange={(e) => setForm({ ...form, story_date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="story-read-time">Read time</label>
            <input id="story-read-time" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="input-field" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600 mt-7">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Mark as featured
          </label>
        </div>
        <div>
          <label className="label-field" htmlFor="story-image">Story image *</label>
          <input id="story-image" type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
          <p className="text-xs text-ink-400 mt-1">Images only, up to 5MB.</p>
        </div>
        {form.image_url && <img src={form.image_url} alt="Story preview" className="h-48 w-full rounded-xl object-cover" />}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          <ImagePlus className="h-4 w-4" /> {saving ? 'Publishing…' : 'Publish Story'}
        </button>
      </form>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : stories.length === 0 ? (
        <div className="card p-10 text-center">
          <BookOpen className="h-10 w-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">No admin-published stories yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <article key={story.id} className="card overflow-hidden">
              <img src={story.image_url} alt={story.title} className="h-40 w-full object-cover" />
              <div className="p-4 flex justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink-900">{story.title}</h2>
                  <p className="text-sm text-ink-500">{story.category}{story.featured ? ' · Featured' : ''}</p>
                </div>
                <button type="button" onClick={() => deleteStory(story.id)} aria-label="Delete story" className="btn-ghost p-2 text-red-600 shrink-0">
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

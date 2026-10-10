import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { readImageFile } from '@/lib/image-upload';

interface EventMediaImage {
  id: string;
  image_url: string;
  caption: string;
  event_name: string;
  year: number;
  created_at: string;
}

export default function AdminEventMedia() {
  const [images, setImages] = useState<EventMediaImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [eventName, setEventName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadImages = async () => {
    const { data, error: queryError } = await api
      .from('event_media')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message || 'Could not load event media.');
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      setImageUrl(await readImageFile(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not read the image.');
      event.target.value = '';
    }
  };

  const addImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl) {
      setError('Choose an image to upload.');
      return;
    }

    setSaving(true);
    setError('');
    const { error: insertError } = await api.from('event_media').insert({
      image_url: imageUrl,
      caption: caption.trim(),
      event_name: eventName.trim(),
      year,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message || 'Could not save event media.');
      return;
    }

    setImageUrl('');
    setCaption('');
    setEventName('');
    await loadImages();
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this event media image?')) return;
    const { error: deleteError } = await api.from('event_media').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message || 'Could not delete the image.');
      return;
    }
    setImages((current) => current.filter((image) => image.id !== id));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-extrabold text-ink-900">Event Media</h1>
        <p className="text-ink-500 text-sm mt-1">Upload and manage photos shown on the Event Media page.</p>
      </div>

      <form onSubmit={addImage} className="card p-5 mb-8 space-y-4 max-w-2xl">
        <div>
          <label className="label-field" htmlFor="event-media-image">Image *</label>
          <input id="event-media-image" type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
          <p className="text-xs text-ink-400 mt-1">Images only, up to 5MB.</p>
        </div>
        {imageUrl && <img src={imageUrl} alt="Event media preview" className="h-40 w-full rounded-xl object-cover" />}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="event-media-caption">Caption</label>
            <input id="event-media-caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="event-media-name">Event name</label>
            <input id="event-media-name" value={eventName} onChange={(e) => setEventName(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="max-w-xs">
          <label className="label-field" htmlFor="event-media-year">Year</label>
          <input id="event-media-year" type="number" min="1900" max="2200" value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field" />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          <ImagePlus className="h-4 w-4" /> {saving ? 'Uploading…' : 'Upload Image'}
        </button>
      </form>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : images.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">No event media images uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="card overflow-hidden">
              <img src={image.image_url} alt={image.caption || 'Event media'} className="h-36 w-full object-cover" />
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800 truncate">{image.caption || 'Untitled image'}</p>
                  <p className="text-xs text-ink-500 truncate">{[image.event_name, image.year].filter(Boolean).join(' · ')}</p>
                </div>
                <button type="button" onClick={() => deleteImage(image.id)} aria-label="Delete image" className="btn-ghost p-2 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

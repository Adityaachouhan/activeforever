import { useEffect, useState, type ChangeEvent } from 'react';
import { Plus, Trash2, X, Save, Images, FolderPlus, Edit3 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminGallery() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [showMediaForm, setShowMediaForm] = useState<string | null>(null);

  const load = async () => {
    const { data: albumsData } = await api.from('gallery_albums').select('*').order('sort_order', { ascending: true });
    if (!albumsData) { setLoading(false); return; }
    const withMedia = await Promise.all(
      albumsData.map(async (a: any) => {
        const { data: media } = await api.from('gallery_media').select('*').eq('album_id', a.id).order('sort_order', { ascending: true });
        return { ...a, media: media || [] };
      })
    );
    setAlbums(withMedia);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveAlbum = async (album: any) => {
    if (editingAlbum) {
      await api.from('gallery_albums').update(album).eq('id', editingAlbum.id);
    } else {
      await api.from('gallery_albums').insert(album);
    }
    setShowAlbumForm(false);
    setEditingAlbum(null);
    load();
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm('Delete this album and all its media?')) return;
    await api.from('gallery_albums').delete().eq('id', id);
    load();
  };

  const addMedia = async (albumId: string, media: { url: string; caption: string; type: string }) => {
    await api.from('gallery_media').insert({ album_id: albumId, ...media, sort_order: 0 });
    setShowMediaForm(null);
    load();
  };

  const deleteMedia = async (id: string) => {
    await api.from('gallery_media').delete().eq('id', id);
    load();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">Gallery Management</h1>
          <p className="text-ink-500 text-sm mt-1">Manage photo and video albums</p>
        </div>
        <button onClick={() => { setEditingAlbum(null); setShowAlbumForm(true); }} className="btn-primary">
          <FolderPlus className="h-4 w-4" /> Add Album
        </button>
      </div>

      {loading ? (
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      ) : albums.length === 0 ? (
        <div className="card p-12 text-center">
          <Images className="h-12 w-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">No albums yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {albums.map((album) => (
            <div key={album.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-ink-900">{album.name}</h3>
                  <p className="text-sm text-ink-500">{album.event_name} · {album.year}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setShowMediaForm(album.id)} className="btn-outline text-sm py-2"><Plus className="h-4 w-4" /> Add Media</button>
                  <button onClick={() => { setEditingAlbum(album); setShowAlbumForm(true); }} className="btn-ghost p-2"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => deleteAlbum(album.id)} className="btn-ghost p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {album.media?.map((m: any) => (
                  <div key={m.id} className="group relative">
                    <img src={m.url} alt={m.caption} className="h-24 w-full rounded-lg object-cover" />
                    <button
                      onClick={() => deleteMedia(m.id)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {(!album.media || album.media.length === 0) && (
                  <p className="text-sm text-ink-400 col-span-full">No media in this album</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAlbumForm && (
        <AlbumForm album={editingAlbum} onSave={saveAlbum} onClose={() => { setShowAlbumForm(false); setEditingAlbum(null); }} />
      )}
      {showMediaForm && (
        <MediaForm onSave={(m) => addMedia(showMediaForm, m)} onClose={() => setShowMediaForm(null)} />
      )}
    </div>
  );
}

function AlbumForm({ album, onSave, onClose }: { album: any | null; onSave: (a: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: album?.name || '',
    event_name: album?.event_name || '',
    year: album?.year || new Date().getFullYear(),
    cover_image: album?.cover_image || '',
    sort_order: album?.sort_order || 0,
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
    reader.onload = () => setForm((prev) => ({ ...prev, cover_image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-ink-900">{album ? 'Edit' : 'Add'} Album</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-field">Album Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div><label className="label-field">Event Name</label><input value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} className="input-field" /></div>
          <div><label className="label-field">Year</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} className="input-field" /></div>
          <div>
            <label className="label-field">Upload Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
          </div>
          {form.cover_image && <img src={form.cover_image} alt="Preview" className="h-24 w-full rounded-xl object-cover" />}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
          <button onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MediaForm({ onSave, onClose }: { onSave: (m: { url: string; caption: string; type: string }) => void; onClose: () => void }) {
  const [form, setForm] = useState({ url: '', caption: '', type: 'photo' });

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please upload an image or video file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File must be 20MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-ink-900">Add Media</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-field">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="photo">Photo</option><option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="label-field">Upload Image/Video *</label>
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="file-input" />
          </div>
          {form.url && form.type === 'photo' && <img src={form.url} alt="Preview" className="h-32 w-full rounded-xl object-cover" />}
          {form.url && form.type === 'video' && (
            <video src={form.url} className="h-32 w-full rounded-xl object-cover" controls />
          )}
          <div><label className="label-field">Caption</label><input value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} className="input-field" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
          <button onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

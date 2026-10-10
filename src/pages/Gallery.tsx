import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useGalleryAlbums } from '@/lib/queries';

export default function Gallery() {
  const { albums, loading } = useGalleryAlbums();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const currentAlbum = albums.find(a => a.id === selectedAlbum);
  const lightboxMedia = currentAlbum?.media || [];

  const allMedia = albums.flatMap(a => a.media || []);

  const openLightbox = (albumId: string, index: number) => {
    setSelectedAlbum(albumId);
    setLightboxIndex(index);
  };

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % lightboxMedia.length);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + lightboxMedia.length) % lightboxMedia.length);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-ink-950 py-16">
        <div className="container-max">
          <span className="eyebrow text-amber-400 mb-3"><Images className="h-4 w-4" /> Past Events</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">Gallery</h1>
          <p className="mt-3 text-lg text-ink-400 max-w-2xl">
            Relive the moments from our events across the years — night runs, marathons, cyclothons, and more.
          </p>
        </div>
      </div>

      <div className="container-max py-10">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-ink-100 animate-pulse" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20">
            <Images className="h-12 w-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500 font-medium">No gallery items yet</p>
          </div>
        ) : (
          <div className="space-y-12">
            {albums.map((album) => (
              <div key={album.id}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-ink-900">{album.name}</h2>
                    <p className="text-sm text-ink-500">{album.event_name} · {album.year}</p>
                  </div>
                  <span className="badge bg-ink-100 text-ink-600">{album.media?.length || 0} photos</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {album.media?.map((media, i) => (
                    <button
                      key={media.id}
                      onClick={() => openLightbox(album.id, i)}
                      className="group relative overflow-hidden rounded-2xl h-48 hover:shadow-card-hover transition-all"
                    >
                      <img
                        src={media.url}
                        alt={media.caption}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/40 transition-colors" />
                      <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {media.caption}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && currentAlbum && lightboxMedia[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-ink-950/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={lightboxMedia[lightboxIndex].url}
            alt={lightboxMedia[lightboxIndex].caption}
            className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white text-sm font-medium">{lightboxMedia[lightboxIndex].caption}</p>
            <p className="text-ink-400 text-xs mt-1">{lightboxIndex + 1} / {lightboxMedia.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

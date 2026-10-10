import { useEffect, useState } from 'react';
import { Play, X, Film, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReveal } from '@/lib/hooks';
import { api } from '@/lib/api';

interface EventPhoto {
  id: number | string;
  src: string;
  caption: string;
  event_name?: string;
  year?: number;
}

const EVENT_MEDIA = [
  {
    id: 1,
    title: 'Jamshedpur Night Run 2024 – Highlights',
    event: 'Jamshedpur Night Run',
    year: 2024,
    type: 'video',
    thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&h=400&w=700',
    duration: '4:32',
    description: 'Relive the electrifying atmosphere of our flagship night run with 10,000+ participants.',
  },
  {
    id: 2,
    title: 'Marathon Finish Line Moments 2024',
    event: 'Jamshedpur Marathon',
    year: 2024,
    type: 'video',
    thumbnail: 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&h=400&w=700',
    duration: '6:15',
    description: 'The raw emotion of crossing the finish line — tears, smiles, and pure triumph.',
  },
  {
    id: 3,
    title: 'Cyclothon 2024 – Full Ride',
    event: 'Active Forever Cyclothon',
    year: 2024,
    type: 'video',
    thumbnail: 'https://images.pexels.com/photos/239379/pexels-photo-239379.jpeg?auto=compress&cs=tinysrgb&h=400&w=700',
    duration: '8:02',
    description: 'Follow our riders through the scenic streets of Jamshedpur in this epic cyclothon.',
  },
  {
    id: 4,
    title: 'Yoga Day Celebration 2024',
    event: 'International Yoga Day',
    year: 2024,
    type: 'video',
    thumbnail: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&h=400&w=700',
    duration: '5:44',
    description: 'Thousands gather for a sunrise yoga session at Jubilee Park.',
  },
  {
    id: 5,
    title: 'Half Marathon 2023 – Race Day Film',
    event: 'Jamshedpur Half Marathon',
    year: 2023,
    type: 'video',
    thumbnail: 'https://images.pexels.com/photos/1461734/pexels-photo-1461734.jpeg?auto=compress&cs=tinysrgb&h=400&w=700',
    duration: '7:20',
    description: 'A cinematic recap of our half marathon featuring elite and amateur runners alike.',
  },
  {
    id: 6,
    title: 'Dream Run 2023 – Family Moments',
    event: 'Dream Run',
    year: 2023,
    type: 'video',
    thumbnail: 'https://images.pexels.com/photos/1452701/pexels-photo-1452701.jpeg?auto=compress&cs=tinysrgb&h=400&w=700',
    duration: '3:58',
    description: 'Families, kids, and first-timers share the joy of running together.',
  },
];

const PHOTOS: EventPhoto[] = [
  { id: 1, src: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Night Run Start Line 2024' },
  { id: 2, src: 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Marathon Finish 2024' },
  { id: 3, src: 'https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Awards Ceremony 2024' },
  { id: 4, src: 'https://images.pexels.com/photos/239379/pexels-photo-239379.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Cyclothon 2024' },
  { id: 5, src: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Yoga Day Sunrise Session' },
  { id: 6, src: 'https://images.pexels.com/photos/1461734/pexels-photo-1461734.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Half Marathon Route 2023' },
  { id: 7, src: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Elite Runners 2023' },
  { id: 8, src: 'https://images.pexels.com/photos/1452701/pexels-photo-1452701.jpeg?auto=compress&cs=tinysrgb&h=500&w=700', caption: 'Dream Run Families 2023' },
];

export default function EventMedia() {
  const [activeTab, setActiveTab] = useState<'videos' | 'photos'>('videos');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<EventPhoto[]>([]);

  const { ref, visible } = useReveal<HTMLDivElement>();
  const photos = [...PHOTOS, ...uploadedPhotos];

  useEffect(() => {
    api
      .from('event_media')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Could not load event media:', error);
          return;
        }
        setUploadedPhotos((data || []).map((image: {
          id: string;
          image_url: string;
          caption: string | null;
          event_name: string | null;
          year: number;
        }) => ({
          id: image.id,
          src: image.image_url,
          caption: image.caption || image.event_name || 'Event photo',
          event_name: image.event_name || '',
          year: image.year,
        })));
      });
  }, []);

  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  };
  const nextPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % photos.length);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-[340px] overflow-hidden bg-ink-950">
        <img
          src="https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&h=800&w=1400"
          alt="Event Media"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-transparent to-ink-950/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="eyebrow justify-center text-amber-400 mb-4">
              <Film className="h-4 w-4" /> News & Media
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white font-display">Event Media</h1>
            <p className="mt-4 text-lg text-ink-300 max-w-2xl mx-auto">
              Watch highlights, race films, and photos from all Active Forever events.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-ink-100 sticky top-16 lg:top-20 z-40">
        <div className="container-max flex gap-1 py-2">
          {(['videos', 'photos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
              }`}
            >
              {tab === 'videos' ? '🎬 Videos' : '🖼️ Photos'}
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className={`container-max py-12 reveal ${visible ? 'is-visible' : ''}`}>
        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <span className="eyebrow"><Film className="h-4 w-4" /> Event Films</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {EVENT_MEDIA.map((media) => (
                <div
                  key={media.id}
                  className="card overflow-hidden group cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  onClick={() => setPlayingId(playingId === media.id ? null : media.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={media.thumbnail}
                      alt={media.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-ink-950/40 group-hover:bg-ink-950/60 transition-colors flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <span className="absolute bottom-3 right-3 bg-ink-950/80 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                      {media.duration}
                    </span>
                    {/* Year badge */}
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {media.year}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{media.event}</span>
                    <h3 className="text-ink-900 font-display font-bold mt-1 mb-2">{media.title}</h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{media.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Photos Grid */}
        {activeTab === 'photos' && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <span className="eyebrow">🖼️ Event Photos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <button
                  key={`${photo.id}-${i}`}
                  onClick={() => setLightboxIndex(i)}
                  className="group relative overflow-hidden rounded-2xl h-48 hover:shadow-card-hover transition-all"
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/50 transition-colors" />
                  <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.caption}
                  </p>
                  {photo.year && (
                    <span className="absolute top-3 left-3 bg-ink-950/70 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                      {photo.year}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Photo Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-ink-950/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={photos[lightboxIndex].src}
            alt={photos[lightboxIndex].caption}
            className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white text-sm font-medium">{photos[lightboxIndex].caption}</p>
            <p className="text-ink-400 text-xs mt-1">{lightboxIndex + 1} / {photos.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

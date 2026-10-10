import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EventObj, Banner, RaceCategoryMicrosite, GalleryAlbum, GalleryMedia, Testimonial } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<EventObj[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: eventsData } = await api
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!eventsData) {
        setLoading(false);
        return;
      }

      const eventsWithCats = await Promise.all(
        eventsData.map(async (e: any) => {
          const { data: cats } = await api
            .from('event_categories')
            .select('*')
            .eq('event_id', e.id)
            .order('sort_order', { ascending: true });
          return { ...e, categories: cats || [] } as EventObj;
        })
      );

      setEvents(eventsWithCats);
      setLoading(false);
    })();
  }, []);

  return { events, loading };
}

export function useEvent(slug: string | undefined) {
  const [event, setEvent] = useState<EventObj | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: eventData } = await api
        .from('events')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!eventData) {
        setLoading(false);
        return;
      }

      const { data: cats } = await api
        .from('event_categories')
        .select('*')
        .eq('event_id', eventData.id)
        .order('sort_order', { ascending: true });

      setEvent({ ...eventData, categories: cats || [] } as EventObj);
      setLoading(false);
    })();
  }, [slug]);

  return { event, loading };
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setBanners(data || []);
        setLoading(false);
      });
  }, []);

  return { banners, loading };
}

export function useRaceCategories() {
  const [categories, setCategories] = useState<RaceCategoryMicrosite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .from('race_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setCategories(data || []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useRaceCategory(slug: string | undefined) {
  const [category, setCategory] = useState<RaceCategoryMicrosite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    api
      .from('race_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        setCategory(data as RaceCategoryMicrosite | null);
        setLoading(false);
      });
  }, [slug]);

  return { category, loading };
}

export function useGalleryAlbums() {
  const [albums, setAlbums] = useState<(GalleryAlbum & { media?: GalleryMedia[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: albumsData } = await api
        .from('gallery_albums')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!albumsData) {
        setLoading(false);
        return;
      }

      const albumsWithMedia = await Promise.all(
        albumsData.map(async (a: any) => {
          const { data: media } = await api
            .from('gallery_media')
            .select('*')
            .eq('album_id', a.id)
            .order('sort_order', { ascending: true });
          return { ...a, media: media || [] };
        })
      );

      setAlbums(albumsWithMedia);
      setLoading(false);
    })();
  }, []);

  return { albums, loading };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setTestimonials(data || []);
        setLoading(false);
      });
  }, []);

  return { testimonials, loading };
}

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, MapPin, Star, Quote,
  Footprints, Moon, Smartphone, Building2, Bike, Flower2,
  Trophy, Users, CalendarDays, Award, Lightbulb,
} from 'lucide-react';
import { useBanners, useEvents, useTestimonials, useGalleryAlbums } from '@/lib/queries';
import { useCountUp, useReveal } from '@/lib/hooks';
import { EventCard } from '@/components/EventCard';

const ICON_MAP: Record<string, typeof Footprints> = {
  Footprints, Moon, Smartphone, Building2, Bike, Flower2,
};

const SERVICES = [
  { icon: 'Footprints', title: 'Marathons', desc: 'Full and half marathons on professionally measured routes with chip timing.' },
  { icon: 'Moon', title: 'Night Runs', desc: 'Energizing night runs under city lights with full safety support.' },
  { icon: 'Smartphone', title: 'Virtual Events', desc: 'Join from any city via our mobile tracking app and compete virtually.' },
  { icon: 'Building2', title: 'Corporate Fitness', desc: 'Custom corporate wellness events and team-building fitness challenges.' },
  { icon: 'Bike', title: 'Cycling Events', desc: 'Cyclothons and group rides for every skill level across cities.' },
  { icon: 'Flower2', title: 'Yoga Events', desc: 'Community yoga sessions promoting holistic health and mindfulness.' },
];

function HeroBanner() {
  const { banners, loading } = useBanners();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="h-[70vh] min-h-[500px] bg-ink-900 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-ink-900">
        <div className="text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white font-display mb-4">
            Active Forever
          </h1>
          <p className="text-xl text-ink-300 mb-8">Run · Move · Inspire</p>
          <Link to="/events" className="btn-primary text-lg px-8 py-4">
            View Upcoming Events <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] min-h-[550px] overflow-hidden">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={banner.image_url}
            alt={banner.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/50 to-ink-950/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-max">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-bold text-amber-300 mb-6">
                  <Calendar className="h-4 w-4" /> Upcoming Event
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight mb-4 text-balance">
                  {banner.title}
                </h1>
                <p className="text-lg sm:text-xl text-ink-200 mb-8 leading-relaxed max-w-xl">
                  {banner.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={banner.cta_link} className="btn-primary text-lg px-8 py-4">
                    {banner.cta_text} <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/events" className="btn-outline border-white/30 text-white hover:border-amber-400 hover:text-amber-400 text-lg px-8 py-4">
                    View All Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-8 bg-amber-500' : 'w-2 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatsSection() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const stats = [
    { value: 260, suffix: '+', label: 'Events Organized', icon: Trophy },
    { value: 15, suffix: '+', label: 'Years Experience', icon: CalendarDays },
    { value: 50000, suffix: '+', label: 'Happy Participants', icon: Users },
    { value: 25, suffix: '+', label: 'Cities Covered', icon: MapPin },
    { value: 40, suffix: '+', label: 'Initiatives Launched', icon: Lightbulb },
  ];

  return (
    <section ref={ref} className="py-20 bg-ink-950">
      <div className="container-max">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {stats.map((stat, i) => (
            <StatCounter key={i} stat={stat} start={visible} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCounter({ stat, start, delay }: { stat: { value: number; suffix: string; label: string; icon: typeof Trophy }; start: boolean; delay: number }) {
  const [shouldStart, setShouldStart] = useState(false);
  const count = useCountUp(stat.value, 2000, shouldStart);

  useEffect(() => {
    if (start) {
      const t = setTimeout(() => setShouldStart(true), delay);
      return () => clearTimeout(t);
    }
  }, [start, delay]);

  return (
    <div className="text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
        <stat.icon className="h-6 w-6" />
      </div>
      <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
        {count.toLocaleString('en-IN')}{stat.suffix}
      </div>
      <div className="mt-2 text-sm text-ink-400 font-medium">{stat.label}</div>
    </div>
  );
}

function UpcomingEventsSection() {
  const { events, loading } = useEvents();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const upcoming = events.filter(e => e.status === 'open' || e.status === 'upcoming').slice(0, 3);

  return (
    <section ref={ref} className={`py-20 bg-ink-50 reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container-max">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="eyebrow mb-3"><Calendar className="h-4 w-4" /> What's Next</span>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">Find your next challenge and register today</p>
          </div>
          <Link to="/events" className="btn-outline shrink-0">
            View All Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-96 animate-pulse bg-ink-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AboutSection() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className={`py-20 bg-white reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="eyebrow mb-3"><Award className="h-4 w-4" /> About Us</span>
            <h2 className="section-title mb-6">Building a Healthier India, One Run at a Time</h2>
            <div className="space-y-4 text-ink-600 leading-relaxed">
              <p>
                Active Forever is a Jamshedpur-based sports event organizing company with over 15 years
                of experience in bringing world-class running events to Eastern India. From the iconic
                Jamshedpur Night Run to full marathons, cyclothons, and virtual races, we create
                experiences that inspire people to move.
              </p>
              <p>
                Our mission is simple: to build a fitter, more active community by organizing
                professional, safe, and unforgettable events. We believe everyone deserves the
                thrill of crossing a finish line — whether on the road or virtually from their own city.
              </p>
              <p>
                With 260+ events organized, 50,000+ happy participants, and presence across 25+ cities,
                Active Forever has become one of the most trusted names in the Indian running community.
              </p>
            </div>
            <div className="mt-8 flex gap-4">
              <Link to="/about" className="btn-secondary">
                Read Our Story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/29840338/pexels-photo-29840338.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Marathon runners"
                className="rounded-3xl object-cover h-64 w-full shadow-card"
                loading="lazy"
              />
              <img
                src="https://images.pexels.com/photos/38674717/pexels-photo-38674717.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Night run"
                className="rounded-3xl object-cover h-64 w-full shadow-card mt-8"
                loading="lazy"
              />
              <img
                src="https://images.pexels.com/photos/36715610/pexels-photo-36715610.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Yoga session"
                className="rounded-3xl object-cover h-64 w-full shadow-card"
                loading="lazy"
              />
              <img
                src="https://images.pexels.com/photos/21588830/pexels-photo-21588830.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Cyclothon"
                className="rounded-3xl object-cover h-64 w-full shadow-card mt-8"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className={`py-20 bg-ink-50 reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container-max">
        <div className="text-center mb-12">
          <span className="eyebrow justify-center mb-3"><Footprints className="h-4 w-4" /> What We Do</span>
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle mx-auto">From marathons to virtual runs, we organize events for every kind of athlete</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon];
            return (
              <div
                key={i}
                className="card p-8 group hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-5 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-ink-900 mb-2">{service.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{service.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GalleryPreview() {
  const { albums, loading } = useGalleryAlbums();
  const { ref, visible } = useReveal<HTMLDivElement>();

  const allImages = albums.flatMap(a => a.media || []).slice(0, 8);

  return (
    <section ref={ref} className={`py-20 bg-white reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container-max">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="eyebrow mb-3"><Trophy className="h-4 w-4" /> Past Events</span>
            <h2 className="section-title">Gallery</h2>
            <p className="section-subtitle">Moments from our events across the years</p>
          </div>
          <Link to="/gallery" className="btn-outline shrink-0">
            View Full Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-ink-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {allImages.map((img, i) => (
              <div
                key={img.id}
                className={`group relative overflow-hidden rounded-2xl ${
                  i === 0 || i === 3 ? 'row-span-2 h-full min-h-[300px]' : 'h-48'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/40 transition-colors" />
                <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { testimonials, loading } = useTestimonials();
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section ref={ref} className={`py-20 bg-ink-950 reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container-max">
        <div className="text-center mb-12">
          <span className="eyebrow justify-center mb-3 text-amber-400"><Quote className="h-4 w-4" /> Testimonials</span>
          <h2 className="section-title text-white">What Our Runners Say</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-ink-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t) => (
              <div key={t.id} className="rounded-2xl bg-ink-900 p-6 border border-ink-800 hover:border-amber-500/30 transition-colors">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-ink-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-ink-500 text-xs">{t.role} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className={`py-20 bg-amber-50 reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container-max">
        <div className="rounded-4xl bg-gradient-to-br from-ink-900 to-ink-800 p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display mb-4 text-balance">
              Ready to Start Your Running Journey?
            </h2>
            <p className="text-lg text-ink-300 mb-8 max-w-xl mx-auto">
              Join thousands of runners across India. Register for an event today and be part of the
              Active Forever community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/events" className="btn-primary text-lg px-8 py-4">
                Register Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/contact" className="btn-outline border-white/30 text-white hover:border-amber-400 hover:text-amber-400 text-lg px-8 py-4">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroBanner />
      <StatsSection />
      <UpcomingEventsSection />
      <AboutSection />
      <ServicesSection />
      <GalleryPreview />
      <TestimonialsSection />
      <ContactCTA />
    </>
  );
}

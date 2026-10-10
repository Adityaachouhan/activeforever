import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useEvent } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const FAQS = [
  { q: 'Is there a cut-off time?', a: 'Yes, the course cut-off time varies by category. Please refer to the race category information page for details.' },
  { q: 'Are there baggage facilities?', a: 'Yes, baggage counters are available near the start area. You will receive a baggage tag with your BIB.' },
  { q: 'Can I transfer my registration to someone else?', a: 'No, entries are non-transferable as per our entry rules and regulations.' },
  { q: 'What is the refund policy?', a: 'Refunds are processed as per the refund policy. Please refer to the BIB Surrender section for details.' },
];

export default function EventDetail() {
  const { slug } = useParams();
  const { event, loading } = useEvent(slug);
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink-900 mb-2">Event Not Found</h1>
          <Link to="/events" className="btn-primary">Back to Events</Link>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = event.status === 'open';

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={event.banner_image} alt={event.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/20" />
        <div className="absolute bottom-0 left-0 right-0 pb-10">
          <div className="container-max">
            <Link to="/events" className="text-sm text-ink-300 hover:text-amber-400 transition-colors mb-3 inline-block">
              ← All Events
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display mb-4 max-w-3xl text-balance">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-ink-200">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-amber-400" /> {formatDate(event.date)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-amber-400" /> {event.venue}, {event.city}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-amber-400" /> {event.categories?.length || 0} Categories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="card p-8">
              <h2 className="text-2xl font-display font-bold text-ink-900 mb-4">About This Event</h2>
              <p className="text-ink-600 leading-relaxed">{event.description}</p>
            </section>

            {/* Categories */}
            <section className="card p-8">
              <h2 className="text-2xl font-display font-bold text-ink-900 mb-6">Race Categories & Pricing</h2>
              <div className="space-y-3">
                {event.categories?.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-ink-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all">
                    <div>
                      <h3 className="font-semibold text-ink-900">{cat.name}</h3>
                      <p className="text-sm text-ink-500">{cat.distance_km} km {cat.description && `· ${cat.description}`}</p>
                    </div>
                    <div className="text-right">
                      {cat.price_inr > 0 ? (
                        <>
                          <div className="font-bold text-ink-900">Rs. {cat.price_inr}</div>
                          {cat.virtual_price_inr > 0 && (
                            <div className="text-xs text-teal-600">Virtual: Rs. {cat.virtual_price_inr}</div>
                          )}
                        </>
                      ) : (
                        <div className="font-bold text-teal-600">Free</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Rules */}
            <section className="card p-8">
              <h2 className="text-2xl font-display font-bold text-ink-900 mb-4">Rules & Guidelines</h2>
              <ul className="space-y-3">
                {[
                  'Participants must carry a valid government-issued photo ID.',
                  'BIB must be worn on the front and visible at all times during the race.',
                  'Entries are non-transferable and non-refundable.',
                  'Participants must follow instructions of race officials and volunteers.',
                  'Hydration stations are available every 2 km along the route.',
                  'Medical support teams are stationed throughout the course.',
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-ink-600">
                    <CheckCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* FAQs */}
            <section className="card p-8">
              <h2 className="text-2xl font-display font-bold text-ink-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-ink-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-ink-50 transition-colors"
                    >
                      <span className="font-semibold text-ink-800 text-sm">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="h-4 w-4 text-ink-400" /> : <ChevronDown className="h-4 w-4 text-ink-400" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-sm text-ink-600 animate-slide-down">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Registration Card */}
              <div className="card p-6">
                <div className="mb-4">
                  <span className={`badge ${isRegistrationOpen ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                    {event.status === 'open' ? 'Registration Open' : event.status}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-ink-900 mb-2">Register for this Event</h3>
                <p className="text-sm text-ink-500 mb-6">
                  {isRegistrationOpen
                    ? 'Complete your registration in a few simple steps.'
                    : 'Registration is currently closed for this event.'}
                </p>

                {isRegistrationOpen ? (
                  <Link
                    to={user ? `/register/${event.slug}` : '/login'}
                    className="btn-primary w-full mb-3"
                  >
                    {user ? 'Register Now' : 'Sign In to Register'} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button disabled className="btn-primary w-full mb-3 opacity-50 cursor-not-allowed">
                    Registration Closed
                  </button>
                )}

                {event.reg_close_date && (
                  <p className="text-xs text-ink-400 text-center">
                    Closes on {formatDate(event.reg_close_date)}
                  </p>
                )}
              </div>

              {/* Event Info */}
              <div className="card p-6">
                <h3 className="text-lg font-display font-bold text-ink-900 mb-4">Event Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-ink-700">Date</div>
                      <div className="text-ink-500">{formatDate(event.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-ink-700">Venue</div>
                      <div className="text-ink-500">{event.venue}, {event.city}, {event.state}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-ink-700">Event Type</div>
                      <div className="text-ink-500 capitalize">{event.event_type.replace('-', ' ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

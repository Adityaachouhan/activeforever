import { Link } from 'react-router-dom';
import { Award, Target, Heart, Users, ArrowRight, Activity, Eye } from 'lucide-react';
import { useReveal } from '@/lib/hooks';

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[320px] overflow-hidden bg-ink-950">
        <img
          src="https://images.pexels.com/photos/29840338/pexels-photo-29840338.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="Marathon"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="eyebrow justify-center text-amber-400 mb-3"><Activity className="h-4 w-4" /> About Us</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display">Active Forever</h1>
            <p className="mt-4 text-lg text-ink-300 max-w-xl mx-auto">Run · Move · Inspire</p>
          </div>
        </div>
      </div>

      {/* Story */}
      <section ref={ref} className={`py-20 bg-white reveal ${visible ? 'is-visible' : ''}`}>
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="eyebrow mb-3"><Award className="h-4 w-4" /> Our Story</span>
              <h2 className="section-title mb-6">From Jamshedpur to All of India</h2>
              <div className="space-y-4 text-ink-600 leading-relaxed">
                <p>
                  Active Forever was founded in Jamshedpur with a simple vision: to create world-class
                  sporting events that inspire people to lead active, healthy lives. What started as a
                  small local running club has grown into one of Eastern India's most trusted sports
                  event organizers.
                </p>
                <p>
                  Over the past 15+ years, we have organized 260+ events including the iconic Jamshedpur
                  Night Run, full and half marathons, cyclothons, yoga day celebrations, and virtual
                  races that connect runners across 25+ cities in India.
                </p>
                <p>
                  Our commitment to professional organization, safety, and participant experience has
                  earned us the trust of over 50,000 participants. We believe that everyone — regardless
                  of age, ability, or location — deserves the thrill of crossing a finish line.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.pexels.com/photos/38674717/pexels-photo-38674717.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Night Run" className="rounded-3xl object-cover h-72 w-full shadow-card" loading="lazy" />
              <img src="https://images.pexels.com/photos/36715610/pexels-photo-36715610.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Yoga" className="rounded-3xl object-cover h-72 w-full shadow-card mt-8" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission/Vision/Values */}
      <section className="py-20 bg-ink-50">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To build a fitter, more active India by organizing professional, safe, and unforgettable sporting events that inspire people to move.' },
              { icon: Eye, title: 'Our Vision', desc: 'To be the most trusted and innovative sports event organizer in India, known for excellence in event management and participant experience.' },
              { icon: Heart, title: 'Our Values', desc: 'Integrity, inclusivity, excellence, and community. We believe in fair play, welcoming all abilities, delivering quality, and giving back.' },
            ].map((item, i) => (
              <div key={i} className="card p-8 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-5">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-ink-900 mb-3">{item.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div className="relative">
              <div className="aspect-square rounded-4xl bg-gradient-to-br from-ink-900 to-ink-700 p-1">
                <div className="h-full w-full rounded-3xl bg-ink-800 flex items-center justify-center">
                  <Users className="h-24 w-24 text-amber-500/30" />
                </div>
              </div>
            </div>
            <div>
              <span className="eyebrow mb-3"><Award className="h-4 w-4" /> Founder</span>
              <h2 className="section-title mb-4">The Passion Behind Active Forever</h2>
              <p className="text-ink-600 leading-relaxed mb-4">
                Active Forever was born from a deep passion for running and community building. Our
                founder, a lifelong runner and fitness enthusiast, saw the need for professionally
                organized sporting events in Jamshedpur and Eastern India.
              </p>
              <p className="text-ink-600 leading-relaxed mb-6">
                Starting with a small group of runners, the vision quickly grew into a full-fledged
                event organization that has touched the lives of thousands. Today, Active Forever
                continues to innovate with virtual races, corporate fitness programs, and inclusive
                events for all abilities.
              </p>
              <Link to="/events" className="btn-primary">
                Join Our Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

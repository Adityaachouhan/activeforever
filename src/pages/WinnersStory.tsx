import { Trophy, Medal, Star, ArrowRight, Clock, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useReveal } from '@/lib/hooks';
import { api } from '@/lib/api';

interface Winner {
  id: number | string;
  name: string;
  category: string;
  year: number;
  time: string;
  city: string;
  rank: number;
  image: string;
  quote: string;
}

const WINNERS: Winner[] = [
  {
    id: 1,
    name: 'Rajesh Kumar Mahato',
    category: 'Full Marathon',
    year: 2024,
    time: '2:28:14',
    city: 'Jamshedpur',
    rank: 1,
    image: 'https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    quote: 'Crossing that finish line was the proudest moment of my life. Active Forever made it possible.',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    category: 'Half Marathon',
    year: 2024,
    time: '1:14:52',
    city: 'Ranchi',
    rank: 1,
    image: '',
    quote: 'Running is my meditation. Winning here proved that consistent training always pays off.',
  },
  {
    id: 3,
    name: 'Amit Singh Rawat',
    category: 'Open 10K',
    year: 2024,
    time: '31:45',
    city: 'Dhanbad',
    rank: 1,
    image: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    quote: 'The crowd energy at Jamshedpur Night Run is unmatched. It pushes you beyond your limits.',
  },
  {
    id: 4,
    name: 'Sunita Devi',
    category: "Senior Citizens' Run",
    year: 2024,
    time: '52:10',
    city: 'Jamshedpur',
    rank: 1,
    image: 'https://images.pexels.com/photos/4473618/pexels-photo-4473618.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    quote: "Age is just a number. At 65, winning proved it's never too late to start running.",
  },
  {
    id: 5,
    name: 'Vikram Nair',
    category: 'Dream Run',
    year: 2023,
    time: '25:33',
    city: 'Bokaro',
    rank: 1,
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    quote: 'Dream Run is where I discovered my love for running. Now I compete every year.',
  },
  {
    id: 6,
    name: 'Ananya Das',
    category: 'Virtual Run',
    year: 2023,
    time: '47:22',
    city: 'Kolkata',
    rank: 1,
    image: 'https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    quote: 'Running virtually from Kolkata and still feeling the Active Forever community spirit was incredible.',
  },
];

const STATS = [
  { label: 'Total Winners', value: '1,200+' },
  { label: 'Years of Glory', value: '15+' },
  { label: 'Categories', value: '8' },
  { label: 'Cities Represented', value: '25+' },
];

const rankColors: Record<number, string> = {
  1: 'from-amber-400 to-yellow-300',
  2: 'from-slate-300 to-slate-200',
  3: 'from-amber-700 to-amber-600',
};

const rankLabel: Record<number, string> = {
  1: '🥇 Gold',
  2: '🥈 Silver',
  3: '🥉 Bronze',
};

export default function WinnersStory() {
  const [uploadedWinners, setUploadedWinners] = useState<Winner[]>([]);
  const { ref: statsRef, visible: statsVisible } = useReveal<HTMLDivElement>();
  const { ref: winnersRef, visible: winnersVisible } = useReveal<HTMLDivElement>();

  useEffect(() => {
    api
      .from('winners_stories')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Could not load winners stories:', error);
          return;
        }
        setUploadedWinners((data || []).map((winner: {
          id: string;
          name: string;
          category: string;
          year: number;
          time: string | null;
          city: string | null;
          rank: number;
          image_url: string;
          quote: string | null;
        }) => ({
          id: winner.id,
          name: winner.name,
          category: winner.category,
          year: winner.year,
          time: winner.time || '',
          city: winner.city || '',
          rank: winner.rank,
          image: winner.image_url,
          quote: winner.quote || '',
        })));
      });
  }, []);

  const winners = [...uploadedWinners, ...WINNERS];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[380px] overflow-hidden bg-ink-950">
        <img
          src="https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&h=800&w=1400"
          alt="Winners crossing finish line"
          className="h-full w-full object-cover opacity-30"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-transparent to-ink-950/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="eyebrow justify-center text-amber-400 mb-4">
              <Trophy className="h-4 w-4" /> Hall of Champions
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white font-display leading-tight">
              Winners Story
            </h1>
            <p className="mt-5 text-lg text-ink-300 max-w-2xl mx-auto leading-relaxed">
              Meet the extraordinary athletes who conquered the finish line and made history at
              Active Forever events.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div
        ref={statsRef}
        className={`bg-amber-500 py-8 reveal ${statsVisible ? 'is-visible' : ''}`}
      >
        <div className="container-max">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-extrabold text-white font-display">{s.value}</p>
                <p className="text-amber-900 font-semibold text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Winners */}
      <section
        ref={winnersRef}
        className={`py-20 bg-ink-50 reveal ${winnersVisible ? 'is-visible' : ''}`}
      >
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="eyebrow justify-center mb-3">
              <Medal className="h-4 w-4" /> Champions of the Track
            </span>
            <h2 className="section-title">Our Champions</h2>
            <p className="mt-3 text-ink-500 max-w-xl mx-auto">
              Stories of grit, dedication, and triumph from runners who pushed every boundary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                {winner.image && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={winner.image}
                      alt={winner.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />

                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${rankColors[winner.rank] || 'from-ink-200 to-ink-100'} text-xs font-bold text-ink-900`}
                    >
                      {rankLabel[winner.rank] || `#${winner.rank}`}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-amber-500/90 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
                        {winner.category}
                      </span>
                      <p className="text-white text-xs opacity-80">{winner.year} Edition</p>
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className="p-6">
                  {!winner.image && (
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
                          {winner.category}
                        </span>
                        <p className="text-xs text-ink-500">{winner.year} Edition</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full bg-gradient-to-r ${rankColors[winner.rank] || 'from-ink-200 to-ink-100'} text-xs font-bold text-ink-900`}
                      >
                        {rankLabel[winner.rank] || `#${winner.rank}`}
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-display font-bold text-ink-900 mb-3">{winner.name}</h3>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-ink-500 text-sm">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-ink-800">{winner.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-500 text-sm">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      <span>{winner.city}</span>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="border-l-4 border-amber-400 pl-4 text-sm text-ink-600 italic leading-relaxed">
                    "{winner.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspirational CTA */}
      <section className="py-20 bg-ink-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-amber-500 blur-3xl" />
        </div>
        <div className="container-max relative text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 mb-6">
            <Star className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white font-display mb-5">
            Your Story Starts Here
          </h2>
          <p className="text-ink-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Every champion began as a beginner. Join our next event and write your own winning story
            with thousands of runners across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/events" className="btn-primary">
              View Upcoming Events <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors font-semibold"
            >
              <Award className="h-4 w-4" /> View Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

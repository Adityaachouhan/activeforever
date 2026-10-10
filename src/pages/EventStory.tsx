import { BookOpen, Clock, User, ArrowRight, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useReveal } from '@/lib/hooks';
import { api } from '@/lib/api';

interface Story {
  id: number | string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured: boolean;
}

const STORIES: Story[] = [
  {
    id: 1,
    title: 'How 10,000 Runners Lit Up Jamshedpur at Night',
    excerpt:
      `The 2024 Jamshedpur Night Run was more than a race — it was a festival of lights, cheers, and community spirit that turned the city's streets into a glowing river of energy.`,
    category: 'Night Run',
    author: 'Active Forever Team',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&h=500&w=800',
    featured: true,
  },
  {
    id: 2,
    title: "From Couch to Finish Line: Riya's Marathon Journey",
    excerpt:
      'A year ago, Riya Agarwal had never run more than 2 km. This year, she crossed the full marathon finish line — and the story of how she got there will inspire you.',
    category: 'Personal Story',
    author: 'Riya Agarwal',
    date: 'Nov 28, 2024',
    readTime: '7 min read',
    image: '',
    featured: false,
  },
  {
    id: 3,
    title: 'Cyclothon 2024: Pedaling Through the Steel City',
    excerpt:
      "Over 2,000 cyclists took to the roads of Jamshedpur in the biggest cyclothon in Eastern India. Here's the inside story of what made it so special.",
    category: 'Cyclothon',
    author: 'Active Forever Team',
    date: 'Oct 12, 2024',
    readTime: '4 min read',
    image: 'https://images.pexels.com/photos/239379/pexels-photo-239379.jpeg?auto=compress&cs=tinysrgb&h=500&w=800',
    featured: false,
  },
  {
    id: 4,
    title: `A 70-Year-Old's First Race — And Why Age Doesn't Matter`,
    excerpt:
      `Mr. Biswas had never run a race in his life until he turned 70. His debut at the Senior Citizens' Run is a masterclass in courage and resilience.`,
    category: 'Personal Story',
    author: 'Editorial',
    date: 'Sep 5, 2024',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/4473618/pexels-photo-4473618.jpeg?auto=compress&cs=tinysrgb&h=500&w=800',
    featured: false,
  },
  {
    id: 5,
    title: 'Breaking Barriers: Champions with Disability at Active Forever',
    excerpt:
      "Our Champions with Disability run brings together some of the most inspiring athletes in the country. This year's edition was nothing short of extraordinary.",
    category: 'Inclusion',
    author: 'Active Forever Team',
    date: 'Aug 20, 2024',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&h=500&w=800',
    featured: false,
  },
  {
    id: 6,
    title: 'Virtual Run 2024: Running Together from 25 Cities',
    excerpt:
      'Runners from Kolkata to Chennai, Mumbai to Guwahati — all part of one race, one community. The Virtual Run 2024 shattered every record.',
    category: 'Virtual Run',
    author: 'Active Forever Team',
    date: 'Jul 4, 2024',
    readTime: '3 min read',
    image: 'https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&h=500&w=800',
    featured: false,
  },
];

const CATEGORIES = ['All', 'Night Run', 'Personal Story', 'Cyclothon', 'Inclusion', 'Virtual Run'];

const categoryColors: Record<string, string> = {
  'Night Run': 'bg-violet-100 text-violet-700',
  'Personal Story': 'bg-rose-100 text-rose-700',
  Cyclothon: 'bg-sky-100 text-sky-700',
  Inclusion: 'bg-green-100 text-green-700',
  'Virtual Run': 'bg-amber-100 text-amber-700',
};

export default function EventStory() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [uploadedStories, setUploadedStories] = useState<Story[]>([]);
  const { ref, visible } = useReveal<HTMLDivElement>();

  useEffect(() => {
    api
      .from('event_stories')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Could not load event stories:', error);
          return;
        }
        setUploadedStories((data || []).map((story: {
          id: string;
          title: string;
          excerpt: string;
          category: string;
          author: string | null;
          story_date: string | null;
          read_time: string | null;
          image_url: string;
          featured: boolean;
        }) => ({
          id: story.id,
          title: story.title,
          excerpt: story.excerpt,
          category: story.category,
          author: story.author || '',
          date: story.story_date || '',
          readTime: story.read_time || '',
          image: story.image_url,
          featured: story.featured,
        })));
      });
  }, []);

  const allStories = [...uploadedStories, ...STORIES];
  const categories = [...new Set([...CATEGORIES, ...uploadedStories.map((story) => story.category).filter(Boolean)])];
  const featured = uploadedStories.find((story) => story.featured) || STORIES.find((story) => story.featured);
  const filtered = allStories.filter(
    (story) => story.id !== featured?.id && (activeCategory === 'All' || story.category === activeCategory)
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-[340px] overflow-hidden bg-ink-950">
        <img
          src="https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&h=800&w=1400"
          alt="Event Stories"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-transparent to-ink-950/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="eyebrow justify-center text-amber-400 mb-4">
              <BookOpen className="h-4 w-4" /> News & Media
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white font-display">Event Story</h1>
            <p className="mt-4 text-lg text-ink-300 max-w-2xl mx-auto">
              In-depth stories, personal journeys, and behind-the-scenes moments from every Active Forever event.
            </p>
          </div>
        </div>
      </div>

      <div className="container-max py-12">
        {/* Featured Story */}
        {featured && (
          <div className="mb-16">
            <span className="eyebrow mb-6"><Tag className="h-4 w-4" /> Featured Story</span>
            <div className="card overflow-hidden lg:flex group cursor-pointer hover:shadow-card-hover transition-all duration-300">
              <div className="lg:w-1/2 h-64 lg:h-auto overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[featured.category] || 'bg-ink-100 text-ink-600'}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-ink-400 font-medium">{featured.date}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-ink-900 mb-4 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-ink-500 leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-ink-500">
                    <User className="h-4 w-4 text-amber-500" />
                    <span>{featured.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-500">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{featured.readTime}</span>
                  </div>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors group/btn">
                  Read Full Story
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal ${visible ? 'is-visible' : ''}`}
        >
          {filtered.map((story) => (
            <article
              key={story.id}
              className="card overflow-hidden group cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              {story.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${categoryColors[story.category] || 'bg-ink-100 text-ink-600'}`}>
                    {story.category}
                  </span>
                </div>
              ) : null}
              <div className="p-6">
                <h3 className="text-ink-900 font-display font-bold text-lg mb-3 leading-snug line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-sm text-ink-500 leading-relaxed line-clamp-3 mb-4">{story.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {story.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {story.readTime}
                    </span>
                  </div>
                  <span className="text-xs text-ink-400">{story.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500 font-medium">No stories in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

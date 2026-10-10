import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, MessageSquare, HelpCircle, ArrowRight, Info, DollarSign } from 'lucide-react';
import { useRaceCategory } from '@/lib/queries';
import { CATEGORY_SUBPAGES, CATEGORY_SUBPAGE_LABELS } from '@/types';

export default function RaceCategoryPage() {
  const { slug, subpage } = useParams();
  const { category, loading } = useRaceCategory(slug);
  const activeSubpage = subpage || 'registration-dates';

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!category) {
    return <Navigate to="/events" replace />;
  }

  if (!CATEGORY_SUBPAGES.includes(activeSubpage as typeof CATEGORY_SUBPAGES[number])) {
    return <Navigate to={`/race-categories/${slug}/registration-dates`} replace />;
  }

  const content = (category.subpages as Record<string, string>)?.[activeSubpage] || 'Content for this section will be available soon.';
  const feesTable = (category.fees_table as { applicant_type: string; fee_inr: number }[]) || [];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Banner */}
      <div className="relative h-[40vh] min-h-[320px] overflow-hidden">
        <img src={category.banner_image} alt={category.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/20" />
        <div className="absolute bottom-0 left-0 right-0 pb-8">
          <div className="container-max">
            <div className="flex items-center gap-2 text-sm text-ink-300 mb-3">
              <Link to="/events" className="hover:text-amber-400">Events</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-semibold">{category.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display">
              {category.name}
            </h1>
            <p className="mt-2 text-ink-300 text-sm uppercase tracking-wider">
              {CATEGORY_SUBPAGE_LABELS[activeSubpage]}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-max py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card p-2">
                <h3 className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-400">
                  {category.name}
                </h3>
                <nav className="space-y-0.5">
                  {CATEGORY_SUBPAGES.map((sp) => {
                    const isActive = sp === activeSubpage;
                    const isNested = sp === 'runners-information';
                    return (
                      <Link
                        key={sp}
                        to={`/race-categories/${slug}/${sp}`}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                          isActive
                            ? 'bg-amber-50 text-amber-700 font-semibold'
                            : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 font-medium'
                        }`}
                      >
                        <span className={isNested ? 'pl-3' : ''}>{CATEGORY_SUBPAGE_LABELS[sp]}</span>
                        {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Register CTA */}
              <div className="card p-5 mt-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <h3 className="font-display font-bold text-lg mb-1">Ready to Run?</h3>
                <p className="text-sm text-amber-50 mb-4">Register for an upcoming event now.</p>
                <Link to="/events" className="inline-flex items-center gap-2 rounded-full bg-white text-amber-700 px-5 py-2.5 text-sm font-semibold hover:bg-amber-50 transition-colors">
                  Register Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card p-8 lg:p-10">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-ink-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  {activeSubpage === 'application-fees' ? <DollarSign className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                </div>
                <h2 className="text-2xl font-display font-bold text-ink-900">
                  {CATEGORY_SUBPAGE_LABELS[activeSubpage]}
                </h2>
              </div>

              {/* Content Body */}
              {activeSubpage === 'application-fees' ? (
                <div>
                  <p className="text-ink-600 leading-relaxed mb-6">{content}</p>
                  {feesTable.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-ink-100">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-ink-900 text-white">
                            <th className="px-6 py-4 text-left font-semibold text-sm">Applicant Type</th>
                            <th className="px-6 py-4 text-right font-semibold text-sm">Fee (INR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feesTable.map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-ink-50' : 'bg-white'}>
                              <td className="px-6 py-4 text-sm font-medium text-ink-700">{row.applicant_type}</td>
                              <td className="px-6 py-4 text-sm font-bold text-ink-900 text-right">
                                Rs. {row.fee_inr.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-ink-600 leading-relaxed whitespace-pre-line">{content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating help button */}
      <Link
        to="/contact"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-amber-500 shadow-card-hover hover:scale-105 transition-transform"
        aria-label="Contact Us"
      >
        <HelpCircle className="h-6 w-6" />
      </Link>

      {/* Left side tab */}
      <Link
        to="/events"
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 group"
      >
        <div className="flex items-center gap-2 rounded-r-2xl bg-amber-500 text-white px-4 py-3 shadow-card hover:bg-amber-600 transition-colors">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap">Ask a Question</span>
        </div>
      </Link>
    </div>
  );
}

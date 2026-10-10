import { useEffect, useState } from 'react';
import { Ticket, Users, CalendarDays, IndianRupee, TrendingUp, Clock } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRegs: 0, revenue: 0, upcomingEvents: 0, totalUsers: 0 });
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ count: totalRegs }, { data: regs }, { count: upcomingEvents }, { count: totalUsers }] = await Promise.all([
        api.from('registrations').select('*', { count: 'exact', head: true }),
        api.from('registrations').select('first_name, last_name, event_name, category_name, status, amount_paid, created_at').order('created_at', { ascending: false }).limit(5),
        api.from('events').select('*', { count: 'exact', head: true }).in('status', ['open', 'upcoming']),
        api.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const revenue = (regs || []).reduce((sum: number, r: any) => sum + (r.amount_paid || 0), 0);
      setStats({
        totalRegs: totalRegs || 0,
        revenue,
        upcomingEvents: upcomingEvents || 0,
        totalUsers: totalUsers || 0,
      });
      setRecentRegs(regs || []);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Total Registrations', value: stats.totalRegs, icon: Ticket, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Revenue', value: `Rs. ${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-50 text-green-600' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: CalendarDays, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-teal-50 text-teal-600' },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-display font-extrabold text-ink-900 mb-2">Dashboard</h1>
      <p className="text-ink-500 text-sm mb-8">Overview of your event management system</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="card p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color} mb-4`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-display font-extrabold text-ink-900">{card.value}</div>
            <div className="text-sm text-ink-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Registrations */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-display font-bold text-ink-900">Recent Registrations</h2>
        </div>

        {recentRegs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-10 w-10 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-ink-400 py-3 px-2">Name</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-ink-400 py-3 px-2 hidden sm:table-cell">Event</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-ink-400 py-3 px-2 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-ink-400 py-3 px-2">Status</th>
                  <th className="text-right text-xs font-bold uppercase tracking-wider text-ink-400 py-3 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.map((r, i) => (
                  <tr key={i} className="border-b border-ink-50">
                    <td className="py-3 px-2 text-sm font-medium text-ink-700">{r.first_name} {r.last_name}</td>
                    <td className="py-3 px-2 text-sm text-ink-600 hidden sm:table-cell">{r.event_name}</td>
                    <td className="py-3 px-2 text-sm text-ink-600 hidden md:table-cell">{r.category_name}</td>
                    <td className="py-3 px-2">
                      <span className={`badge ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-ink-900 text-right">Rs. {r.amount_paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

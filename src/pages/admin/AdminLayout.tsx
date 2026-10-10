import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Image, CalendarDays, Tags, Ticket, Images,
  Users, MessageSquare, Activity, LogOut, Menu, X, Film, BookOpen, Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/categories', label: 'Race Categories', icon: Tags },
  { to: '/admin/registrations', label: 'Registrations', icon: Ticket },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/event-media', label: 'Event Media', icon: Film },
  { to: '/admin/event-stories', label: 'Event Stories', icon: BookOpen },
  { to: '/admin/winners-stories', label: 'Winners Story', icon: Trophy },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
];

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin' && user.role !== 'staff') return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink-950 text-ink-300 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-ink-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-ink-950">
              <Activity className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-extrabold text-white text-sm">Active Forever</div>
              <div className="text-xs text-ink-500">Admin Panel</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {ADMIN_LINKS.map((link) => {
            const isActive = link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-amber-500 text-ink-950' : 'text-ink-400 hover:bg-ink-800 hover:text-white'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ink-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-semibold text-sm">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name || 'Admin'}</div>
              <div className="text-xs text-ink-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-ink-400 hover:text-white transition-colors w-full">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-ink-950 text-white p-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-sm">Admin Panel</span>
          <div className="w-5" />
        </div>

        <Outlet />
      </div>
    </div>
  );
}

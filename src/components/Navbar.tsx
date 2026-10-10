import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'About Us', to: '/about' },
  {
    label: 'Race Categories',
    children: [
      { label: 'Marathon', to: '/race-categories/marathon/registration-dates' },
      { label: 'Half Marathon', to: '/race-categories/half-marathon/registration-dates' },
      { label: 'Open 10K', to: '/race-categories/open-10k/registration-dates' },
      { label: 'Dream Run', to: '/race-categories/dream-run/registration-dates' },
      { label: "Senior Citizens' Run", to: '/race-categories/senior-citizens-run/registration-dates' },
      { label: 'Champions with Disability', to: '/race-categories/champions-with-disability/registration-dates' },
      { label: 'Virtual Run', to: '/race-categories/virtual-run/registration-dates' },
      { label: 'Marathon - Elite', to: '/race-categories/marathon-elite/registration-dates' },
    ],
  },
  { label: 'Events', to: '/events' },
  {
    label: 'News & Media',
    children: [
      { label: 'Gallery', to: '/gallery' },
      { label: 'Event Media', to: '/news-media/event-media' },
      { label: 'Event Story', to: '/news-media/event-story' },
    ],
  },
  { label: 'Winners Story', to: '/winners-story' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenMenus, setMobileOpenMenus] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileOpenMenus({});
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-card' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="w-full flex h-16 lg:h-20 items-center justify-between pl-8 pr-10 sm:pl-12 sm:pr-16 lg:pl-20 lg:pr-24">
        {/* Logo */}
        <Link to="/" className="shrink-0 group">
          <img
            src="/black logo_1.png"
            alt="Active Forever – Wellness, Events & Entertainment"
            className="h-12 lg:h-16 w-auto max-w-[10rem] lg:max-w-[13rem] object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="relative group">
              {item.to ? (
                <Link
                  to={item.to}
                  className="px-4 py-2 text-sm font-semibold text-ink-700 hover:text-amber-600 transition-colors rounded-lg"
                >
                  {item.label}
                </Link>
              ) : (
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-ink-700 hover:text-amber-600 transition-colors rounded-lg">
                  {item.label}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>
              )}

              {/* Mega menu dropdown */}
              {item.children && (
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-72 rounded-2xl bg-white p-2 shadow-card-hover border border-ink-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-ink-50 text-sm font-medium text-ink-700 hover:text-amber-600 transition-colors group/item"
                      >
                        {child.label}
                        <ChevronRight className="h-4 w-4 text-ink-300 group-hover/item:text-amber-500 group-hover/item:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* User menu */}
          {user ? (
            <div className="relative hidden lg:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ink-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-ink-700">{user.name || 'Account'}</span>
                <ChevronDown className="h-4 w-4 text-ink-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 animate-slide-down">
                  <div className="rounded-2xl bg-white p-2 shadow-card-hover border border-ink-100">
                    <Link to="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink-50 text-sm font-medium text-ink-700">
                      <User className="h-4 w-4 text-ink-400" />
                      My Account
                    </Link>
                    {user.role === 'admin' || user.role === 'staff' ? (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink-50 text-sm font-medium text-ink-700">
                        <Shield className="h-4 w-4 text-ink-400" />
                        Admin Panel
                      </Link>
                    ) : null}
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink-50 text-sm font-medium text-ink-700"
                    >
                      <LogOut className="h-4 w-4 text-ink-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden lg:inline-flex btn-primary text-sm px-5 py-2.5">
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl hover:bg-ink-100 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-100 bg-white animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container-max py-4 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setMobileOpenMenus((prev) => ({
                        ...prev,
                        [item.label]: !prev[item.label],
                      }))
                    }
                    className="flex w-full items-center justify-between px-4 py-3 rounded-xl hover:bg-ink-50 font-semibold text-ink-700"
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpenMenus[item.label] ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileOpenMenus[item.label] && (
                    <div className="pl-4 space-y-1 animate-slide-down">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-ink-50 text-sm font-medium text-ink-600"
                        >
                          {child.label}
                          <ChevronRight className="h-4 w-4 text-ink-300" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.to!}
                  className="block px-4 py-3 rounded-xl hover:bg-ink-50 font-semibold text-ink-700"
                >
                  {item.label}
                </Link>
              )
            )}

            {/* User section */}
            <div className="pt-3 border-t border-ink-100">
              {user ? (
                <>
                  <Link to="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink-50 font-semibold text-ink-700">
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  {user.role === 'admin' || user.role === 'staff' ? (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink-50 font-semibold text-ink-700">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  ) : null}
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink-50 font-semibold text-ink-700"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 rounded-xl bg-amber-500 text-white font-semibold text-center">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

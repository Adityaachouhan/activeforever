import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="container-max py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/black logo_1.png"
                alt="Active Forever – Wellness, Events & Entertainment"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-ink-400 leading-relaxed mb-6">
              Jamshedpur's premier sports event organizing company. Running events, night runs,
              marathons, and virtual races across multiple cities in India.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 hover:bg-amber-500 hover:text-ink-950 transition-all"
                  aria-label="Social media"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Upcoming Events', to: '/events' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-ink-400 hover:text-amber-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Race Categories */}
          <div>
            <h4 className="text-white font-display font-bold mb-4 text-sm uppercase tracking-wider">Race Categories</h4>
            <ul className="space-y-3">
              {[
                { label: 'Marathon', to: '/race-categories/marathon/registration-dates' },
                { label: 'Half Marathon', to: '/race-categories/half-marathon/registration-dates' },
                { label: 'Open 10K', to: '/race-categories/open-10k/registration-dates' },
                { label: 'Virtual Run', to: '/race-categories/virtual-run/registration-dates' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-ink-400 hover:text-amber-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-display font-bold mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-ink-400">
                <MapPin className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <span>Jamshedpur, Jharkhand, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-ink-400">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <a href="tel:+91 98765 43210" className="hover:text-amber-500 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-ink-400">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <a href="mailto:info@activeforever.in" className="hover:text-amber-500 transition-colors">info@activeforever.in</a>
              </li>
            </ul>
            <div className="mt-6">
              <div className="flex items-center gap-2 rounded-xl bg-ink-800 p-1.5">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-ink-500 px-3 py-2 focus:outline-none"
                />
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-ink-950 hover:bg-amber-400 transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-500">Subscribe for event updates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-max py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Active Forever. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-ink-500">
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

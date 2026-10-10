import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-8xl sm:text-9xl font-extrabold text-amber-500">404</h1>
        <h2 className="text-2xl font-display font-bold text-ink-900 mt-4 mb-2">Page Not Found</h2>
        <p className="text-ink-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <Link to="/events" className="btn-outline">
            <ArrowLeft className="h-4 w-4" /> View Events
          </Link>
        </div>
      </div>
    </div>
  );
}

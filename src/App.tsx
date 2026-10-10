import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import { PublicLayout } from '@/components/PublicLayout';

import Home from '@/pages/Home';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import About from '@/pages/About';
import Gallery from '@/pages/Gallery';
import Contact from '@/pages/Contact';
import RaceCategoryPage from '@/pages/RaceCategoryPage';
import Login from '@/pages/Login';
import Account from '@/pages/Account';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import WinnersStory from '@/pages/WinnersStory';
import EventMedia from '@/pages/EventMedia';
import EventStory from '@/pages/EventStory';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminRegistrations from '@/pages/admin/AdminRegistrations';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminEventMedia from '@/pages/admin/AdminEventMedia';
import AdminEventStories from '@/pages/admin/AdminEventStories';
import AdminWinnersStories from '@/pages/admin/AdminWinnersStories';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
          <Route path="/events/:slug" element={<PublicLayout><EventDetail /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/race-categories/:slug/:subpage" element={<PublicLayout><RaceCategoryPage /></PublicLayout>} />
          <Route path="/race-categories/:slug" element={<PublicLayout><RaceCategoryPage /></PublicLayout>} />

          <Route path="/winners-story" element={<PublicLayout><WinnersStory /></PublicLayout>} />
          <Route path="/news-media/event-media" element={<PublicLayout><EventMedia /></PublicLayout>} />
          <Route path="/news-media/event-story" element={<PublicLayout><EventStory /></PublicLayout>} />

          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/account" element={<PublicLayout><Account /></PublicLayout>} />
          <Route path="/register/:eventSlug" element={<PublicLayout><Register /></PublicLayout>} />

          <Route path="/admin/login" element={<PublicLayout><AdminLogin /></PublicLayout>} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="event-media" element={<AdminEventMedia />} />
            <Route path="event-stories" element={<AdminEventStories />} />
            <Route path="winners-stories" element={<AdminWinnersStories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
          </Route>

          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

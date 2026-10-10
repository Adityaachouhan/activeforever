import type { Pool } from 'pg';

export async function seedInitialData(pool: Pool) {
  try {
    // 1. Check if admin user exists
    const adminCheck = await pool.query("SELECT id FROM profiles WHERE role = 'admin' LIMIT 1");
    if (adminCheck.rowCount === 0) {
      console.log('Seeding default admin user (mobile: 9999999999)...');
      await pool.query(`
        INSERT INTO profiles (id, name, email, mobile, role)
        VALUES ('00000000-0000-0000-0000-000000000001', 'Admin ActiveForever', 'admin@activeforever.in', '9999999999', 'admin')
        ON CONFLICT (id) DO NOTHING
      `);
    }

    // 2. Check if banners exist
    const bannerCheck = await pool.query('SELECT id FROM banners LIMIT 1');
    if (bannerCheck.rowCount === 0) {
      console.log('Seeding initial banners...');
      await pool.query(`
        INSERT INTO banners (title, subtitle, image_url, cta_text, cta_link, sort_order, is_active)
        VALUES 
          ('Active Forever City Marathon 2026', 'Ignite Your Spirit — Run Through The Heart of the City', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1920&auto=format&fit=crop', 'Register Now', '/events/city-marathon-2026', 1, true),
          ('Midnight Neon Run — Pune', 'Electrifying 5K & 10K under vibrant city lights with live beats & glow gear', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1920&auto=format&fit=crop', 'Explore Event', '/events/midnight-neon-run-2026', 2, true),
          ('Virtual Global Run 2026', 'Run anywhere, anytime. Earn an exclusive medal and digital finisher certificate.', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1920&auto=format&fit=crop', 'Join Virtually', '/events/virtual-global-run-2026', 3, true)
      `);
    }

    // 3. Check if events exist
    const eventCheck = await pool.query('SELECT id FROM events LIMIT 1');
    if (eventCheck.rowCount === 0) {
      console.log('Seeding initial events and categories...');
      
      const event1 = await pool.query(`
        INSERT INTO events (slug, name, description, date, end_date, city, venue, state, event_type, banner_image, status, reg_open_date, reg_close_date)
        VALUES (
          'city-marathon-2026',
          'Active Forever City Marathon 2026',
          'The premier annual endurance event bringing together over 10,000 passionate runners across scenic flat routes with RFID chip timing, hydration stations every 2km, medical support, and official timed certificates.',
          '2026-11-15',
          '2026-11-15',
          'Mumbai',
          'Bandra-Kurla Complex (BKC) Grounds',
          'Maharashtra',
          'both',
          'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop',
          'open',
          '2026-08-01',
          '2026-11-05'
        ) RETURNING id
      `);

      const event1Id = event1.rows[0].id;
      await pool.query(`
        INSERT INTO event_categories (event_id, slug, name, description, distance_km, price_inr, virtual_price_inr, max_participants, sort_order)
        VALUES 
          ($1, 'full-marathon', 'Full Marathon (42.195 KM)', 'For seasoned runners aiming for personal records on a flat certified course.', 42, 2200, 1200, 2000, 1),
          ($1, 'half-marathon', 'Half Marathon (21.097 KM)', 'Most popular competitive distance with elite pacers and wave starts.', 21, 1800, 1000, 4000, 2),
          ($1, '10k-timed-run', '10K Timed Run', 'Fast-paced timed race ideal for intermediate runners.', 10, 1300, 750, 3000, 3),
          ($1, '5k-fun-run', '5K Dream Run / Walk', 'Non-timed open category celebrating fitness, family, and community.', 5, 800, 500, 2500, 4)
      `, [event1Id]);

      const event2 = await pool.query(`
        INSERT INTO events (slug, name, description, date, end_date, city, venue, state, event_type, banner_image, status, reg_open_date, reg_close_date)
        VALUES (
          'midnight-neon-run-2026',
          'Midnight Neon Glow Run — Pune',
          'Experience the rhythm of the night! High-energy neon lights, glow bands, DJ zones, and a post-run music festival.',
          '2026-12-19',
          '2026-12-19',
          'Pune',
          'Balewadi Stadium Sports Complex',
          'Maharashtra',
          'on-ground',
          'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop',
          'open',
          '2026-09-01',
          '2026-12-10'
        ) RETURNING id
      `);

      const event2Id = event2.rows[0].id;
      await pool.query(`
        INSERT INTO event_categories (event_id, slug, name, description, distance_km, price_inr, virtual_price_inr, max_participants, sort_order)
        VALUES 
          ($1, '10k-neon-challenge', '10K Neon Challenge', 'Timed night run through illuminated boulevards.', 10, 1400, 0, 1500, 1),
          ($1, '5k-glow-party', '5K Glow Party Run', 'Costumes, neon colors, glow sticks, and high-energy music.', 5, 950, 0, 3000, 2)
      `, [event2Id]);

      const event3 = await pool.query(`
        INSERT INTO events (slug, name, description, date, end_date, city, venue, state, event_type, banner_image, status, reg_open_date, reg_close_date)
        VALUES (
          'virtual-global-run-2026',
          'Active Forever Virtual Global Run 2026',
          'Participate from anywhere in the world at your own pace! Submit your Strava, Garmin, or Nike Run data and receive an authentic heavy metal medal via courier.',
          '2026-10-01',
          '2026-12-31',
          'Worldwide',
          'Virtual (Anywhere on Earth)',
          'All States / Global',
          'virtual',
          'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
          'open',
          '2026-08-01',
          '2026-12-25'
        ) RETURNING id
      `);

      const event3Id = event3.rows[0].id;
      await pool.query(`
        INSERT INTO event_categories (event_id, slug, name, description, distance_km, price_inr, virtual_price_inr, max_participants, sort_order)
        VALUES 
          ($1, 'virtual-half-marathon', 'Virtual Half Marathon (21.1 KM)', 'Track with GPS and get delivered an exclusive collector medal.', 21, 999, 999, 5000, 1),
          ($1, 'virtual-10k', 'Virtual 10K Run', 'Complete 10K anywhere outdoors or on a treadmill.', 10, 799, 799, 5000, 2),
          ($1, 'virtual-5k', 'Virtual 5K Challenge', 'Accessible fitness challenge for all ages worldwide.', 5, 599, 599, 5000, 3)
      `, [event3Id]);
    }

    // 4. Check if race categories microsites exist
    const raceCatCheck = await pool.query('SELECT id FROM race_categories LIMIT 1');
    if (raceCatCheck.rowCount === 0) {
      console.log('Seeding race category microsites...');
      const defaultFees = JSON.stringify([
        { applicant_type: 'Domestic Applicants', fee_inr: 1800 },
        { applicant_type: 'Overseas Applicants', fee_inr: 3500 },
      ]);

      const subpages = JSON.stringify({
        'registration-dates': 'Online registrations open from August 1, 2026 to November 5, 2026 or until slots fill up.',
        'information': 'Standard timed race conforming to World Athletics standards with electronic chip timing.',
        'application-fees': 'All fees include participant kit, dri-fit technical t-shirt, finisher medal, timing certificate, and post-race hot breakfast.',
        'how-to-apply': 'Select your preferred distance, fill out personal and emergency contact details, and submit verification.',
        'confirmation-criteria': 'Participants must be at least 18 years of age on race day for Half and Full Marathon.',
        'road-race-technical-standards': 'Strict anti-littering policy, pacers every 15 minutes, and water stations every 2 kilometers.',
        'entry-rules-regulations': 'Bibs are non-transferable. Display bib clearly on the chest throughout the race.',
        'start-waves': 'Wave A: Sub 1:45 hr qualifiers. Wave B: 1:45 to 2:15 hr. Wave C: Open wave.',
        'pacers': 'Official pacers available for 1h45m, 2h00m, 2h15m, 2h30m, and 2h45m bus.',
        'faqs': 'Hydration, baggage counter, parking facilities, and portable restrooms are provided at the holding area.',
        'prize-money': 'Top 3 Overall Men & Women: 1st ₹1,00,000, 2nd ₹60,000, 3rd ₹40,000.',
        'prize-money-rules': 'Prize money will be transferred via NEFT within 30 days post dope-testing clearance.',
        'bib-surrender': 'Bib cancellation available up to 30 days prior to the race subject to cancellation guidelines.',
        'upgrade-downgrade-race-category': 'Category changes permitted till October 15, 2026 upon paying the difference fee.',
        'runners-information': 'Expo bib collection takes place from November 12-14, 2026. Carry photo ID.'
      });

      await pool.query(`
        INSERT INTO race_categories (slug, name, banner_image, sort_order, is_active, subpages, fees_table)
        VALUES 
          ('half-marathon', 'Half Marathon (21.097 KM)', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop', 1, true, $1, $2),
          ('10k-run', '10K Timed Run', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200&auto=format&fit=crop', 2, true, $1, $2),
          ('full-marathon', 'Full Marathon (42.195 KM)', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop', 3, true, $1, $2),
          ('5k-dream-run', '5K Dream Run', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop', 4, true, $1, $2)
      `, [subpages, defaultFees]);
    }

    // 5. Check if testimonials exist
    const testCheck = await pool.query('SELECT id FROM testimonials LIMIT 1');
    if (testCheck.rowCount === 0) {
      console.log('Seeding initial testimonials...');
      await pool.query(`
        INSERT INTO testimonials (name, role, city, quote, rating, sort_order)
        VALUES 
          ('Rohan Sharma', 'Half Marathoner (PB 1:44)', 'Mumbai', 'Active Forever organized the smoothest marathon experience I have had in India. Route management and hydration support were world-class!', 5, 1),
          ('Priya Venkatesh', 'Fitness Enthusiast & 10K Runner', 'Bangalore', 'The night run had an electric atmosphere! Loved the neon vibes, DJ stations, and great crowd support all along the way.', 5, 2),
          ('Arjun Nair', 'Ultra Marathoner & Pacer', 'Delhi', 'Accurate chip timing, quick bib distribution, and delicious recovery breakfast. Highly recommended for beginners and elites alike.', 5, 3)
      `);
    }

    // 6. Check gallery albums
    const albumCheck = await pool.query('SELECT id FROM gallery_albums LIMIT 1');
    if (albumCheck.rowCount === 0) {
      console.log('Seeding gallery albums and media...');
      const album1 = await pool.query(`
        INSERT INTO gallery_albums (name, event_name, year, cover_image, sort_order)
        VALUES ('City Marathon Highlights', 'Active Forever City Marathon', 2025, 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=800&auto=format&fit=crop', 1)
        RETURNING id
      `);

      const album1Id = album1.rows[0].id;
      await pool.query(`
        INSERT INTO gallery_media (album_id, type, url, thumbnail, caption, sort_order)
        VALUES 
          ($1, 'photo', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=400&auto=format&fit=crop', 'Start line wave excitement', 1),
          ($1, 'photo', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop', 'Runners pacing across the sea link', 2),
          ($1, 'photo', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400&auto=format&fit=crop', 'Crossing the glorious finish line', 3)
      `, [album1Id]);
    }

    console.log('Initial PostgreSQL seed data check completed successfully.');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

-- PostgreSQL Schema for Active Forever

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text DEFAULT '',
  mobile text NOT NULL DEFAULT '',
  dob date,
  gender text,
  city text DEFAULT '',
  address text DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','staff')),
  created_at timestamptz DEFAULT now()
);

-- Users alias view
CREATE OR REPLACE VIEW users AS SELECT * FROM profiles;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  end_date date,
  city text NOT NULL,
  venue text DEFAULT '',
  state text DEFAULT '',
  event_type text NOT NULL DEFAULT 'on-ground' CHECK (event_type IN ('on-ground','virtual','both')),
  banner_image text DEFAULT '',
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','open','closed','completed')),
  reg_open_date date,
  reg_close_date date,
  route_map_url text,
  created_at timestamptz DEFAULT now()
);

-- Event categories
CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  distance_km numeric(6,2) DEFAULT 0,
  price_inr integer DEFAULT 0,
  virtual_price_inr integer DEFAULT 0,
  max_participants integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  UNIQUE(event_id, slug)
);

ALTER TABLE event_categories
  ALTER COLUMN distance_km TYPE numeric(6,2)
  USING distance_km::numeric(6,2);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  category_id uuid REFERENCES event_categories(id) ON DELETE SET NULL,
  category_name text NOT NULL,
  participation_type text NOT NULL DEFAULT 'on-ground' CHECK (participation_type IN ('on-ground','virtual')),
  bib_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed','pending','cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('dev-bypassed','pending','paid')),
  amount_paid integer DEFAULT 0,
  first_name text NOT NULL,
  middle_name text DEFAULT '',
  last_name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  gender text NOT NULL,
  dob date NOT NULL,
  country text NOT NULL DEFAULT 'India',
  state text NOT NULL DEFAULT '',
  city text NOT NULL,
  pincode text NOT NULL,
  address text NOT NULL,
  nationality text NOT NULL DEFAULT 'Indian',
  occupation text DEFAULT '',
  running_club_member boolean DEFAULT false,
  medical_professional boolean DEFAULT false,
  reg_code text DEFAULT '',
  iia_member boolean,
  iia_membership_number text NOT NULL DEFAULT '',
  id_proof_type text DEFAULT '',
  id_proof_number text DEFAULT '',
  photo_url text DEFAULT '',
  disability_type text DEFAULT '',
  emergency_contact_1_name text NOT NULL,
  emergency_contact_1_mobile text NOT NULL,
  emergency_contact_1_relation text NOT NULL,
  emergency_contact_2_name text DEFAULT '',
  emergency_contact_2_mobile text DEFAULT '',
  emergency_contact_2_relation text DEFAULT '',
  hear_about text DEFAULT '',
  transport_mode text DEFAULT '',
  consent_medical boolean DEFAULT false,
  consent_waiver boolean DEFAULT false,
  consent_true_info boolean DEFAULT false,
  consent_emergency_care boolean DEFAULT false,
  consent_whatsapp boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS iia_member boolean,
  ADD COLUMN IF NOT EXISTS iia_membership_number text NOT NULL DEFAULT '';

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  image_url text NOT NULL,
  cta_text text DEFAULT 'Register Now',
  cta_link text DEFAULT '/events',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Gallery albums
CREATE TABLE IF NOT EXISTS gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  event_name text DEFAULT '',
  year integer NOT NULL DEFAULT 2026,
  cover_image text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Gallery media
CREATE TABLE IF NOT EXISTS gallery_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'photo' CHECK (type IN ('photo','video')),
  url text NOT NULL,
  thumbnail text DEFAULT '',
  caption text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Event media photos
CREATE TABLE IF NOT EXISTS event_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text DEFAULT '',
  event_name text DEFAULT '',
  year integer NOT NULL DEFAULT 2026,
  created_at timestamptz DEFAULT now()
);

-- Event stories
CREATE TABLE IF NOT EXISTS event_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  author text DEFAULT '',
  story_date text DEFAULT '',
  read_time text DEFAULT '',
  image_url text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Winners stories
CREATE TABLE IF NOT EXISTS winners_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT 2026,
  time text DEFAULT '',
  city text DEFAULT '',
  rank integer NOT NULL DEFAULT 1,
  image_url text NOT NULL,
  quote text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Race category microsites
CREATE TABLE IF NOT EXISTS race_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  banner_image text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  subpages jsonb NOT NULL DEFAULT '{}',
  fees_table jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT '',
  city text DEFAULT '',
  quote text NOT NULL,
  rating integer DEFAULT 5,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_event_categories_event ON event_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_gallery_media_album ON gallery_media(album_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_event_stories_created ON event_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_winners_stories_created ON winners_stories(created_at DESC);

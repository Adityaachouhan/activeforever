export interface EventCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  distance_km: number;
  price_inr: number;
  virtual_price_inr: number;
  max_participants: number;
  sort_order: number;
}

export interface EventObj {
  id: string;
  slug: string;
  name: string;
  description: string;
  date: string;
  end_date: string | null;
  city: string;
  venue: string;
  state: string;
  event_type: 'on-ground' | 'virtual' | 'both';
  banner_image: string;
  status: 'upcoming' | 'open' | 'closed' | 'completed';
  reg_open_date: string;
  reg_close_date: string;
  categories: EventCategory[];
  route_map_url: string | null;
  created_at: string;
}

export interface RaceCategoryMicrosite {
  id: string;
  slug: string;
  name: string;
  banner_image: string;
  sort_order: number;
  is_active: boolean;
  subpages: Record<string, string>;
  fees_table: { applicant_type: string; fee_inr: number }[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  event_name: string;
  year: number;
  cover_image: string;
}

export interface GalleryMedia {
  id: string;
  album_id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  caption: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  quote: string;
  rating: number;
}

export interface Registration {
  id: string;
  registration_id: string;
  user_id: string;
  event_id: string;
  event_name: string;
  category_id: string;
  category_name: string;
  participation_type: 'on-ground' | 'virtual';
  bib_number: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: 'dev-bypassed' | 'pending' | 'paid';
  amount_paid: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  nationality: string;
  occupation: string;
  running_club_member: boolean;
  medical_professional: boolean;
  reg_code: string;
  iia_member: boolean | null;
  iia_membership_number: string;
  id_proof_type: string;
  id_proof_number: string;
  photo_url: string;
  disability_type: string;
  emergency_contact_1_name: string;
  emergency_contact_1_mobile: string;
  emergency_contact_1_relation: string;
  emergency_contact_2_name: string;
  emergency_contact_2_mobile: string;
  emergency_contact_2_relation: string;
  hear_about: string;
  transport_mode: string;
  consent_medical: boolean;
  consent_waiver: boolean;
  consent_true_info: boolean;
  consent_emergency_care: boolean;
  consent_whatsapp: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dob: string | null;
  gender: string | null;
  city: string;
  address: string;
  role: 'user' | 'admin' | 'staff';
  created_at: string;
}

export const CATEGORY_SUBPAGES = [
  'registration-dates',
  'information',
  'application-fees',
  'how-to-apply',
  'confirmation-criteria',
  'road-race-technical-standards',
  'entry-rules-regulations',
  'start-waves',
  'pacers',
  'faqs',
  'prize-money',
  'prize-money-rules',
  'bib-surrender',
  'upgrade-downgrade-race-category',
  'runners-information',
] as const;

export const CATEGORY_SUBPAGE_LABELS: Record<string, string> = {
  'registration-dates': 'Registration Dates',
  'information': 'Information',
  'application-fees': 'Application Fees',
  'how-to-apply': 'How To Apply',
  'confirmation-criteria': 'Confirmation Criteria',
  'road-race-technical-standards': 'Road Race Technical Standards & Timing Recognition Guidelines',
  'entry-rules-regulations': 'Entry Rules & Regulations',
  'start-waves': 'Start Waves',
  'pacers': 'Pacers',
  'faqs': 'FAQs',
  'prize-money': 'Prize Money',
  'prize-money-rules': 'Prize Money Rules',
  'bib-surrender': 'BIB Surrender',
  'upgrade-downgrade-race-category': 'Upgrade / Downgrade Race Category',
  'runners-information': "Runners Information",
};

export const SERVICES = [
  { icon: 'Footprints', title: 'Marathons', desc: 'Full and half marathons on professionally measured routes with chip timing.' },
  { icon: 'Moon', title: 'Night Runs', desc: 'Energizing night runs under city lights with full safety support.' },
  { icon: 'Smartphone', title: 'Virtual Events', desc: 'Join from any city via our mobile tracking app and compete virtually.' },
  { icon: 'Building2', title: 'Corporate Fitness', desc: 'Custom corporate wellness events and team-building fitness challenges.' },
  { icon: 'Bike', title: 'Cycling Events', desc: 'Cyclothons and group rides for every skill level across cities.' },
  { icon: 'Flower2', title: 'Yoga Events', desc: 'Community yoga sessions promoting holistic health and mindfulness.' },
];

export const DEFAULT_FEES_TABLE = [
  { applicant_type: 'Domestic Applicants', fee_inr: 1500 },
  { applicant_type: 'Overseas Applicants', fee_inr: 3500 },
];

export const DEFAULT_SUBPAGE_CONTENT: Record<string, string> = {
  'registration-dates': 'Registration for this category opens soon. Please check back for updated dates.',
  'information': 'Detailed information about this race category will be displayed here.',
  'application-fees': 'Application fees for this category are listed in the table below.',
  'how-to-apply': 'To apply, create an account, select this event and category, and complete the registration form.',
  'confirmation-criteria': 'Confirmation criteria and required documentation will be listed here.',
  'road-race-technical-standards': 'Technical standards and timing recognition guidelines will be displayed here.',
  'entry-rules-regulations': 'Entry rules and regulations for this category will be displayed here.',
  'start-waves': 'Start wave assignments will be published closer to the event date.',
  'pacers': 'Pacer information and target finish times will be listed here.',
  'faqs': 'Frequently asked questions for this category will be displayed here.',
  'prize-money': 'Prize money details for top finishers will be listed here.',
  'prize-money-rules': 'Rules governing prize money distribution will be displayed here.',
  'bib-surrender': 'BIB surrender and transfer policies will be displayed here.',
  'upgrade-downgrade-race-category': 'Upgrade and downgrade policies for race categories will be displayed here.',
  'runners-information': 'General runner information and race regulations will be displayed here.',
};

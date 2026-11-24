const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    isConfigured = true;
    console.log('✓ Connected to Supabase with Service Role privileges.');
  } catch (error) {
    console.warn('! Supabase initialization failed:', error.message);
  }
} else {
  console.warn('! SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing or invalid.');
  console.warn('! Operating in local mock store mode for testing & development.');
}

// In-Memory fallback store when live Supabase is not connected
const mockStore = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Admire Lead Artist',
      email: 'admin@admirebeauty.com',
      phone: '+44 7700 900123',
      role: 'admin',
      created_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Elena Rostova',
      email: 'elena@example.com',
      phone: '+44 7700 900456',
      role: 'customer',
      created_at: new Date('2026-02-10').toISOString(),
    }
  ],
  services: [
    {
      id: 'srv-bridal',
      name: 'Bridal Makeup',
      description: 'Timeless, luminous bridal artistry crafted to perfection. Includes skin prep, custom lash styling, luxury long-wear complexion, and bridal touch-up kit.',
      price: 220.00,
      duration: 120,
      image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
      is_active: true,
      sort_order: 1,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'srv-birthday',
      name: 'Birthday Glam',
      description: 'Celebrate in radiant luxury. Dramatic or soft sultry glam tailored to your birthday outfit and aesthetic. Includes sculpted contouring and high-impact lash artistry.',
      price: 120.00,
      duration: 90,
      image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      is_active: true,
      sort_order: 2,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'srv-photoshoot',
      name: 'Photoshoot Makeup',
      description: 'High-definition editorial makeup optimized for studio flash and natural sunlight. HD anti-flashback complexions, precise sculpting, and flawless camera finish.',
      price: 150.00,
      duration: 100,
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      is_active: true,
      sort_order: 3,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'srv-fullglam',
      name: 'Full Glam',
      description: 'Unapologetic drama and elegance. Smokey eyes, cut-crease artistry, velvet lips, and radiant highlight designed for red carpet events and milestone evenings.',
      price: 135.00,
      duration: 90,
      image_url: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1200&q=80',
      is_active: true,
      sort_order: 4,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    }
  ],
  availability: [
    { id: 'av-0', day_of_week: 0, start_time: '09:00:00', end_time: '18:00:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: false },
    { id: 'av-1', day_of_week: 1, start_time: '09:00:00', end_time: '18:00:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: false },
    { id: 'av-2', day_of_week: 2, start_time: '09:00:00', end_time: '18:00:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: true },
    { id: 'av-3', day_of_week: 3, start_time: '09:00:00', end_time: '18:00:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: true },
    { id: 'av-4', day_of_week: 4, start_time: '09:00:00', end_time: '18:00:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: true },
    { id: 'av-5', day_of_week: 5, start_time: '09:00:00', end_time: '19:00:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: true },
    { id: 'av-6', day_of_week: 6, start_time: '08:30:00', end_time: '18:30:00', slot_duration_minutes: 90, buffer_minutes: 15, is_available: true },
  ],
  blocked_dates: [
    { id: 'blk-1', date: '2026-12-25', reason: 'Christmas Holiday', created_at: new Date().toISOString() },
    { id: 'blk-2', date: '2026-12-26', reason: 'Boxing Day', created_at: new Date().toISOString() },
    { id: 'blk-3', date: '2027-01-01', reason: 'New Year Day', created_at: new Date().toISOString() }
  ],
  bookings: [
    {
      id: 'bkg-101',
      booking_reference: 'AB-2026-8941',
      customer_id: '00000000-0000-0000-0000-000000000002',
      service_id: 'srv-bridal',
      full_name: 'Elena Rostova',
      email: 'elena@example.com',
      phone: '+44 7700 900456',
      appointment_date: '2026-11-28',
      start_time: '10:00',
      end_time: '12:00',
      message: 'Bridal trial for my winter wedding ceremony in London.',
      status: 'confirmed',
      admin_notes: 'Deposit received. Client requested champagne nude tones.',
      created_at: new Date('2026-11-20T14:30:00Z').toISOString(),
      updated_at: new Date('2026-11-21T09:00:00Z').toISOString(),
    },
    {
      id: 'bkg-102',
      booking_reference: 'AB-2026-9022',
      customer_id: null,
      service_id: 'srv-birthday',
      full_name: 'Sophia Williams',
      email: 'sophia.w@example.com',
      phone: '+44 7700 900789',
      appointment_date: '2026-11-29',
      start_time: '14:00',
      end_time: '15:30',
      message: '25th Birthday celebration glam. Golden shimmer eyes please!',
      status: 'pending',
      admin_notes: '',
      created_at: new Date('2026-11-23T10:15:00Z').toISOString(),
      updated_at: new Date('2026-11-23T10:15:00Z').toISOString(),
    }
  ],
  support_tickets: [
    {
      id: 'tkt-1',
      customer_id: '00000000-0000-0000-0000-000000000002',
      customer_email: 'elena@example.com',
      customer_name: 'Elena Rostova',
      subject: 'Question regarding skin prep before bridal appointment',
      message: 'Hello! Should I exfoliate my skin the morning of the appointment or 48 hours prior?',
      status: 'resolved',
      created_at: new Date('2026-11-21T11:00:00Z').toISOString(),
      updated_at: new Date('2026-11-21T12:30:00Z').toISOString(),
    }
  ],
  support_replies: [
    {
      id: 'rep-1',
      ticket_id: 'tkt-1',
      sender_id: '00000000-0000-0000-0000-000000000001',
      sender_name: 'Admire Beauty Lead Artist',
      is_admin: true,
      message: 'Hi Elena! We recommend gentle exfoliation 48 hours prior to avoid any micro-redness on the day. Keep your skin deeply hydrated with a gentle hyaluronic serum the evening before!',
      created_at: new Date('2026-11-21T12:30:00Z').toISOString(),
    }
  ]
};

module.exports = {
  supabase,
  isConfigured,
  mockStore,
};

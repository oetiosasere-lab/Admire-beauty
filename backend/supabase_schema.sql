-- ====================================================================
-- ADMIRE BEAUTY - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom Enum / Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email & role for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration INTEGER NOT NULL DEFAULT 90 CHECK (duration > 0), -- duration in minutes
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active, sort_order);

-- 5. AVAILABILITY TABLE (Business working days & hours)
-- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  slot_duration_minutes INTEGER NOT NULL DEFAULT 90 CHECK (slot_duration_minutes >= 30),
  buffer_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_minutes >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BLOCKED DATES TABLE (Vacations, Holidays, Studio maintenance)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(date);

-- 7. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON public.bookings(booking_reference);

-- Unique index to prevent double bookings on the exact same date and start_time unless cancelled
CREATE UNIQUE INDEX IF NOT EXISTS idx_prevent_double_booking
ON public.bookings(appointment_date, start_time)
WHERE status != 'cancelled';

-- 8. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_customer ON public.support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);

-- 9. SUPPORT REPLIES TABLE
CREATE TABLE IF NOT EXISTS public.support_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_ticket ON public.support_replies(ticket_id);

-- ====================================================================
-- AUTOMATIC TIMESTAMP & PROFILE TRIGGERS
-- ====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_services_updated_at ON public.services;
CREATE TRIGGER trigger_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_availability_updated_at ON public.availability;
CREATE TRIGGER trigger_availability_updated_at
BEFORE UPDATE ON public.availability
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trigger_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Auto create profile on auth.user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Valued Client'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Users can read their own profile; admins can read all profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile fields, but CANNOT self-promote to admin
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
  );

-- Admins have full access on profiles
CREATE POLICY "Admins full access on profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 2. Services Policies
-- Anyone (public or authenticated) can view active services; admins can view all
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

-- Only admins can modify services
CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE USING (public.is_admin());

-- 3. Availability Policies
-- Public can view availability
CREATE POLICY "Public can read availability" ON public.availability
  FOR SELECT USING (TRUE);

-- Only admins can modify availability
CREATE POLICY "Admins modify availability" ON public.availability
  FOR ALL USING (public.is_admin());

-- 4. Blocked Dates Policies
-- Public can view blocked dates
CREATE POLICY "Public can read blocked dates" ON public.blocked_dates
  FOR SELECT USING (TRUE);

-- Only admins can modify blocked dates
CREATE POLICY "Admins modify blocked dates" ON public.blocked_dates
  FOR ALL USING (public.is_admin());

-- 5. Bookings Policies
-- Customers can view their own bookings; admins can view all bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    customer_id = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
    public.is_admin()
  );

-- Customers / Guests can insert a booking
CREATE POLICY "Anyone can insert booking" ON public.bookings
  FOR INSERT WITH CHECK (TRUE);

-- Customers can cancel their own pending booking
CREATE POLICY "Users can cancel own booking" ON public.bookings
  FOR UPDATE USING (
    (customer_id = auth.uid() AND status = 'pending') OR public.is_admin()
  );

-- Admins can update/delete any booking
CREATE POLICY "Admins full access on bookings" ON public.bookings
  FOR ALL USING (public.is_admin());

-- 6. Support Tickets Policies
-- Users can view their own tickets; admins can view all
CREATE POLICY "Users view own support tickets" ON public.support_tickets
  FOR SELECT USING (customer_id = auth.uid() OR public.is_admin());

-- Authenticated users can create tickets
CREATE POLICY "Users create support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = customer_id OR public.is_admin());

-- Admins can update tickets
CREATE POLICY "Admins update support tickets" ON public.support_tickets
  FOR UPDATE USING (public.is_admin());

-- 7. Support Replies Policies
-- Users can view replies on their own tickets; admins can view all
CREATE POLICY "Users view replies on their tickets" ON public.support_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND (customer_id = auth.uid() OR public.is_admin())
    )
  );

-- Users or admins can insert replies on their tickets
CREATE POLICY "Users and admins insert replies" ON public.support_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND (customer_id = auth.uid() OR public.is_admin())
    )
  );

-- ====================================================================
-- SEED INITIAL DATA (Services & Default Working Schedule)
-- ====================================================================

-- Insert Services
INSERT INTO public.services (name, description, price, duration, image_url, is_active, sort_order)
VALUES
  (
    'Bridal Makeup',
    'Timeless, luminous bridal artistry crafted to perfection. Includes full skin prep, luxury long-wear complexion, custom lash application, touch-up kit, and bespoke bridal consultation.',
    220.00,
    120,
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    1
  ),
  (
    'Birthday Glam',
    'Celebrate in radiant luxury. Dramatic or soft sultry glam tailored to your birthday outfit and aesthetic. Includes sculpted contouring, radiant highlight, and statement lash artistry.',
    120.00,
    90,
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    2
  ),
  (
    'Photoshoot Makeup',
    'High-definition editorial makeup optimized for studio strobe and outdoor lighting. HD anti-flashback complexions, precise sculpting, and versatile styling for fashion or branding campaigns.',
    150.00,
    100,
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    3
  ),
  (
    'Full Glam',
    'Unapologetic drama and elegance. Smokey eyes, flawless cut-crease, velvet lips, and high-impact radiance designed for galas, red carpets, and milestone evening affairs.',
    135.00,
    90,
    'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    4
  )
ON CONFLICT DO NOTHING;

-- Insert Default Working Availability:
-- Tuesday (2) through Saturday (6): 09:00 - 18:00 (Available)
-- Sunday (0) and Monday (1): Closed
INSERT INTO public.availability (day_of_week, start_time, end_time, slot_duration_minutes, buffer_minutes, is_available)
VALUES
  (0, '09:00:00', '18:00:00', 90, 15, FALSE), -- Sunday closed
  (1, '09:00:00', '18:00:00', 90, 15, FALSE), -- Monday closed
  (2, '09:00:00', '18:00:00', 90, 15, TRUE),  -- Tuesday 9am - 6pm
  (3, '09:00:00', '18:00:00', 90, 15, TRUE),  -- Wednesday 9am - 6pm
  (4, '09:00:00', '18:00:00', 90, 15, TRUE),  -- Thursday 9am - 6pm
  (5, '09:00:00', '19:00:00', 90, 15, TRUE),  -- Friday 9am - 7pm
  (6, '08:30:00', '18:30:00', 90, 15, TRUE)   -- Saturday 8:30am - 6:30pm
ON CONFLICT (day_of_week) DO NOTHING;

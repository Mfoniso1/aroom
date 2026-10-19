-- ==============================================================================
-- AROOM PILOT: ALL-IN-ONE SUPABASE SQL SETUP
-- Copy and paste this entire file into your Supabase Dashboard -> SQL Editor -> Run.
-- Works directly with SUPABASE_URL + SUPABASE_ANON_KEY (no service_role needed).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE user_type_enum AS ENUM ('student', 'non_student', 'agent', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE account_status_enum AS ENUM ('active', 'suspended', 'pending_verification', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE account_status_enum ADD VALUE IF NOT EXISTS 'rejected';

DO $$ BEGIN
    CREATE TYPE agent_kind_enum AS ENUM ('agent', 'landlord');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE trust_tier_enum AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE room_type_enum AS ENUM ('self_contain', 'single_room', 'flat_shared', 'flat_entire');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE availability_status_enum AS ENUM ('available', 'held', 'taken');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('unverified_new', 'pending_inspection', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    institutional_email_domains TEXT[] NOT NULL DEFAULT '{}',
    geographic_boundaries JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    user_type user_type_enum NOT NULL DEFAULT 'student',
    account_status account_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    agency_name VARCHAR(255),
    id_card_image_url TEXT NOT NULL,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    trust_tier trust_tier_enum NOT NULL DEFAULT 'bronze',
    trust_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    total_inspections INT NOT NULL DEFAULT 0,
    successful_deals INT NOT NULL DEFAULT 0,
    no_show_count INT NOT NULL DEFAULT 0,
    response_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    agent_kind agent_kind_enum NOT NULL DEFAULT 'agent',
    coverage_areas TEXT[] NOT NULL DEFAULT '{}',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    phone_contacted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_agent UNIQUE(user_id)
);

ALTER TABLE agent_profiles
    ADD COLUMN IF NOT EXISTS agent_kind agent_kind_enum NOT NULL DEFAULT 'agent',
    ADD COLUMN IF NOT EXISTS coverage_areas TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS phone_contacted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE RESTRICT,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    room_type room_type_enum NOT NULL,
    price_annual_kobo BIGINT NOT NULL,
    price_monthly_kobo BIGINT,
    landmark_vicinity VARCHAR(255) NOT NULL,
    move_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    availability_status availability_status_enum NOT NULL DEFAULT 'available',
    verification_status verification_status_enum NOT NULL DEFAULT 'unverified_new',
    is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    payload JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Pilot RLS Policies (allows SUPABASE_ANON_KEY to operate during the pilot)
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pilot anon full access campuses" ON campuses;
CREATE POLICY "Pilot anon full access campuses" ON campuses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot anon full access users" ON users;
CREATE POLICY "Pilot anon full access users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot anon full access agent_profiles" ON agent_profiles;
CREATE POLICY "Pilot anon full access agent_profiles" ON agent_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot anon full access listings" ON listings;
CREATE POLICY "Pilot anon full access listings" ON listings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pilot anon full access notifications" ON notifications;
CREATE POLICY "Pilot anon full access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 4. Seed Campuses & Team Leader
INSERT INTO campuses (id, name, short_code, city, state, institutional_email_domains)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'University of Lagos', 'UNILAG', 'Yaba, Lagos', 'Lagos State', ARRAY['@live.unilag.edu.ng', '@unilag.edu.ng']),
  ('c2222222-2222-2222-2222-222222222222', 'University of Port Harcourt', 'UNIPORT', 'Port Harcourt', 'Rivers State', ARRAY['@uniport.edu.ng']),
  ('c3333333-3333-3333-3333-333333333333', 'University of Benin', 'UNIBEN', 'Benin City', 'Edo State', ARRAY['@uniben.edu'])
ON CONFLICT (short_code) DO NOTHING;

-- Seed Team Leader (admin) + Verified Pilot Agent (Femi Ogundipe)
INSERT INTO users (id, phone_number, email, password_hash, user_type, account_status)
VALUES
  ('e0000000-0000-0000-0000-000000000001', '+2340000000001', 'teamleader@aroom.ng', 'TeamLead@12345', 'admin', 'active'),
  ('d1111111-1111-1111-1111-111111111111', '+2348011112222', 'femi.ogundipe@aroomagents.ng', 'Agent@12345', 'agent', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_profiles (id, user_id, full_name, agency_name, id_card_image_url, is_phone_verified, trust_tier, trust_score, agent_kind, phone_contacted, reviewed_by, reviewed_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Femi Ogundipe', 'Akoka Campus Homes Ltd', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', TRUE, 'gold', 96.5, 'agent', TRUE, 'e0000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 5. WhatsApp Agent Bookings Table (for Twilio WhatsApp + AI Concierge)
CREATE TABLE IF NOT EXISTS whatsapp_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref VARCHAR(30) UNIQUE NOT NULL,
    student_phone VARCHAR(30) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    agent_profile_id UUID REFERENCES agent_profiles(id) ON DELETE SET NULL,
    listing_title VARCHAR(255) NOT NULL,
    preferred_slot VARCHAR(255) NOT NULL,
    total_move_in_kobo BIGINT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE whatsapp_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pilot anon full access whatsapp_bookings" ON whatsapp_bookings;
CREATE POLICY "Pilot anon full access whatsapp_bookings" ON whatsapp_bookings FOR ALL USING (true) WITH CHECK (true);

-- 6. WhatsApp Multi-Turn Conversation Memory Table (for OpenRouter AI Chat Context)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_phone VARCHAR(30) NOT NULL,
    student_name VARCHAR(255) DEFAULT 'Campus Student',
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_created
    ON whatsapp_messages (student_phone, created_at DESC);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pilot anon full access whatsapp_messages" ON whatsapp_messages;
CREATE POLICY "Pilot anon full access whatsapp_messages" ON whatsapp_messages FOR ALL USING (true) WITH CHECK (true);




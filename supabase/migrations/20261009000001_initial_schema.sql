-- ==============================================================================
-- Aroom: Production Schema DDL Migration
-- Migration: 20261009000001_initial_schema.sql
-- Description: Core schema including users, profiles, campuses, listings,
--              inquiries, reviews, availability reports, and audit logs.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums
DO $$ BEGIN
    CREATE TYPE user_type_enum AS ENUM ('student', 'non_student', 'agent', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status_enum AS ENUM ('active', 'suspended', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE room_type_enum AS ENUM ('self_contain', 'single_room', 'flat_shared', 'flat_entire');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_status_enum AS ENUM ('available', 'held', 'taken');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('unverified_new', 'pending_inspection', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trust_tier_enum AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_status_enum AS ENUM ('requested', 'accepted', 'rejected', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE source_channel_enum AS ENUM ('whatsapp', 'web');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Campuses
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

-- 2. Users Table
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

-- 3. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id),
    matric_number VARCHAR(100),
    institutional_email VARCHAR(255),
    student_id_image_url VARCHAR(512),
    is_institution_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    CONSTRAINT unique_user_student UNIQUE(user_id)
);

-- 4. Agent Profiles
CREATE TABLE IF NOT EXISTS agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    agency_name VARCHAR(255),
    id_card_image_url VARCHAR(512) NOT NULL,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    trust_tier trust_tier_enum NOT NULL DEFAULT 'bronze',
    trust_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    total_inspections INT NOT NULL DEFAULT 0,
    successful_deals INT NOT NULL DEFAULT 0,
    no_show_count INT NOT NULL DEFAULT 0,
    response_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_agent UNIQUE(user_id)
);

-- 5. Listings Table
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
    coordinates POINT,
    move_in_date DATE NOT NULL,
    availability_status availability_status_enum NOT NULL DEFAULT 'available',
    verification_status verification_status_enum NOT NULL DEFAULT 'unverified_new',
    is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
    boosted_until TIMESTAMPTZ,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Listing Media
CREATE TABLE IF NOT EXISTS listing_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    media_url VARCHAR(512) NOT NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'image',
    is_live_upload BOOLEAN NOT NULL DEFAULT FALSE,
    exif_geo_metadata JSONB,
    sort_order INT NOT NULL DEFAULT 0
);

-- 7. Inquiries and Inspections
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE RESTRICT,
    source_channel source_channel_enum NOT NULL DEFAULT 'whatsapp',
    status inquiry_status_enum NOT NULL DEFAULT 'requested',
    inspection_slot TIMESTAMPTZ,
    student_note TEXT,
    agent_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Availability Reports
CREATE TABLE IF NOT EXISTS availability_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reported_status availability_status_enum NOT NULL,
    comments TEXT,
    ai_sentiment_score FLOAT,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Post-Contact Reviews & Ratings
CREATE TABLE IF NOT EXISTS inspection_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE RESTRICT,
    rating_stars INT CHECK (rating_stars >= 1 AND rating_stars <= 5),
    visited_property BOOLEAN NOT NULL,
    accurately_described BOOLEAN NOT NULL,
    agent_showed_up BOOLEAN NOT NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_inquiry_review UNIQUE(inquiry_id)
);

-- 10. WhatsApp Conversation Session State
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp_phone VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_state VARCHAR(64) NOT NULL DEFAULT 'START',
    context_slots JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID,
    action_type VARCHAR(100) NOT NULL,
    state_before JSONB,
    state_after JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast searches
CREATE INDEX IF NOT EXISTS idx_listings_search_composite 
    ON listings(campus_id, availability_status, verification_status, room_type, price_annual_kobo);

CREATE INDEX IF NOT EXISTS idx_listings_availability 
    ON listings(availability_status) WHERE availability_status = 'available';

CREATE INDEX IF NOT EXISTS idx_inquiries_agent_status 
    ON inquiries(agent_id, status);

CREATE INDEX IF NOT EXISTS idx_conversation_phone_active 
    ON conversation_sessions(whatsapp_phone, expires_at);

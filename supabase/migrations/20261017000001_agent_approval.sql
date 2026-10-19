-- ==============================================================================
-- Aroom: Team-Leader approval of agents & landlords (pilot)
-- Migration: 004_agent_approval.sql   (idempotent: safe to re-run)
-- Mirrors supabase/migrations/20261017000001_agent_approval.sql
-- ==============================================================================

-- 1. Account status: add 'rejected'
ALTER TYPE account_status_enum ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Agent kind enum
DO $$ BEGIN
    CREATE TYPE agent_kind_enum AS ENUM ('agent', 'landlord');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Review fields on agent_profiles
ALTER TABLE agent_profiles
    ADD COLUMN IF NOT EXISTS agent_kind agent_kind_enum NOT NULL DEFAULT 'agent',
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS phone_contacted BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. In-app notifications (Team Leader bell)
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

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON notifications(recipient_user_id, read_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_profiles_user ON agent_profiles(user_id);

-- 5. Private storage bucket for agent ID cards (Team Leader views via signed URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('agent-ids', 'agent-ids', FALSE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
-- No public storage policies: only the backend (service role) reads/writes this bucket.

-- 6. Pilot Team Leader (user_type = 'admin').
-- NOTE: no password hash is seeded here on purpose. Set it once after migrating:
--   cd backend && npm run seed:team-leader
INSERT INTO users (id, phone_number, email, user_type, account_status)
VALUES ('e0000000-0000-0000-0000-000000000001', '+2340000000001', 'teamleader@aroom.ng', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;

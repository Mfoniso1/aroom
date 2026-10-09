-- ==============================================================================
-- Aroom: Supabase Storage Buckets & Row Level Security (RLS) Policies
-- Migration: 003_storage_and_rls.sql
-- ==============================================================================

-- 1. Create Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('listing-images', 'listing-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
    ('agent-id-cards', 'agent-id-cards', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('student-ids', 'student-ids', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies
-- Public can view listing images
CREATE POLICY "Public Access for Listing Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Authenticated users / agents can upload listing images
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images');

-- 3. Enable Row Level Security on Core Tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Public & Student Read Access
-- Everyone (anon + auth) can read campuses
CREATE POLICY "Public Read Campuses"
ON campuses FOR SELECT
USING (true);

-- Everyone can view active/available listings
CREATE POLICY "Public Read Listings"
ON listings FOR SELECT
USING (true);

-- Everyone can view listing media
CREATE POLICY "Public Read Listing Media"
ON listing_media FOR SELECT
USING (true);

-- Public can view public agent stats
CREATE POLICY "Public Read Agent Profiles"
ON agent_profiles FOR SELECT
USING (true);

-- Users can view and update their own record
CREATE POLICY "Users can manage own record"
ON users FOR ALL
USING (auth.uid() = id);

-- Agents can manage their own listings
CREATE POLICY "Agents can insert own listings"
ON listings FOR INSERT
WITH CHECK (
    agent_id IN (
        SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Agents can update own listings"
ON listings FOR UPDATE
USING (
    agent_id IN (
        SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
);

-- Inquiries: Students can view their own, agents can view inquiries for their listings
CREATE POLICY "Users can view relevant inquiries"
ON inquiries FOR SELECT
USING (
    student_id = auth.uid() OR
    agent_id IN (SELECT id FROM agent_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Students can create inquiries"
ON inquiries FOR INSERT
WITH CHECK (
    student_id = auth.uid()
);

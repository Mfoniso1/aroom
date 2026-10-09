-- ==============================================================================
-- Aroom: Pilot Campus (UNILAG) Seed Data
-- Migration: 20261009000002_seed_pilot_unilag.sql
-- ==============================================================================

-- 1. Pilot Campus: University of Lagos (UNILAG)
INSERT INTO campuses (id, name, short_code, city, state, institutional_email_domains, geographic_boundaries)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'University of Lagos',
    'UNILAG',
    'Yaba, Lagos',
    'Lagos State',
    ARRAY['@live.unilag.edu.ng', '@unilag.edu.ng'],
    '{"center": [6.5181, 3.3995], "radius_km": 4.5, "popular_landmarks": ["Akoka Gate", "Abule Oja", "Onike", "Bariga", "St. Finbarrs", "Yaba Tech Junction"]}'::jsonb
) ON CONFLICT (short_code) DO NOTHING;

-- 2. Seed Agents (1 Gold, 1 Silver, 1 New Bronze)
-- Agent 1: Femi Ogundipe (Gold Tier, Established, 98% Response)
INSERT INTO users (id, phone_number, email, user_type, account_status)
VALUES (
    'u1111111-1111-1111-1111-111111111111',
    '+2348011112222',
    'femi.ogundipe@aroomagents.ng',
    'agent',
    'active'
) ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO agent_profiles (id, user_id, full_name, agency_name, id_card_image_url, is_phone_verified, trust_tier, trust_score, total_inspections, successful_deals, no_show_count, response_rate_pct)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'u1111111-1111-1111-1111-111111111111',
    'Femi Ogundipe',
    'Akoka Campus Homes Ltd',
    'https://cdn.aroom.ng/agents/ids/femi_verified_nin.jpg',
    TRUE,
    'gold',
    96.50,
    42,
    38,
    0,
    98.00
) ON CONFLICT (user_id) DO NOTHING;

-- Agent 2: Chinedu Eze (Silver Tier)
INSERT INTO users (id, phone_number, email, user_type, account_status)
VALUES (
    'u2222222-2222-2222-2222-222222222222',
    '+2348033334444',
    'chinedu.eze@yabahouses.ng',
    'agent',
    'active'
) ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO agent_profiles (id, user_id, full_name, agency_name, id_card_image_url, is_phone_verified, trust_tier, trust_score, total_inspections, successful_deals, no_show_count, response_rate_pct)
VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'u2222222-2222-2222-2222-222222222222',
    'Chinedu Eze',
    'Lagoon View Realty',
    'https://cdn.aroom.ng/agents/ids/chinedu_id.jpg',
    TRUE,
    'silver',
    82.00,
    18,
    14,
    1,
    91.50
) ON CONFLICT (user_id) DO NOTHING;

-- 3. Seed Students
-- Student 1: Verified UNILAG Student
INSERT INTO users (id, phone_number, email, user_type, account_status)
VALUES (
    'u3333333-3333-3333-3333-333333333333',
    '+2348055556666',
    'c.okeke@live.unilag.edu.ng',
    'student',
    'active'
) ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO student_profiles (id, user_id, campus_id, matric_number, institutional_email, is_institution_verified, verified_at)
VALUES (
    's1111111-1111-1111-1111-111111111111',
    'u3333333-3333-3333-3333-333333333333',
    'c1111111-1111-1111-1111-111111111111',
    '190404012',
    'c.okeke@live.unilag.edu.ng',
    TRUE,
    NOW() - INTERVAL '10 days'
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Seed Listings
-- Listing 1: Verified Self-Contain at Akoka Gate
INSERT INTO listings (
    id, agent_id, campus_id, title, description, room_type, 
    price_annual_kobo, landmark_vicinity, move_in_date, 
    availability_status, verification_status, is_boosted, view_count
) VALUES (
    'l1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Standard Executive Self-Contain (Serviced water + prepaid meter)',
    'Well ventilated studio room with personal kitchen, tiled bathroom, running borehole water, and dedicated prepaid electric meter. 5 minutes walk to UNILAG gate.',
    'self_contain',
    35000000, -- ₦350,000/yr (35,000,000 Kobo)
    'Akoka Gate (5 mins walk)',
    CURRENT_DATE + INTERVAL '7 days',
    'available',
    'verified',
    TRUE,
    148
) ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_media (listing_id, media_url, media_type, is_live_upload, sort_order)
VALUES 
    ('l1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'image', TRUE, 0),
    ('l1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'image', FALSE, 1)
ON CONFLICT (id) DO NOTHING;

-- Listing 2: Unverified - New Single Room at Abule Oja (Agent posted, pending spot check)
INSERT INTO listings (
    id, agent_id, campus_id, title, description, room_type, 
    price_annual_kobo, landmark_vicinity, move_in_date, 
    availability_status, verification_status, is_boosted, view_count
) VALUES (
    'l2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111',
    'Budget Single Room in Abule Oja',
    'Decent single room in a clean shared compound. Shared clean bathroom. Gated compound with 24/7 security guard.',
    'single_room',
    18000000, -- ₦180,000/yr (18,000,000 Kobo)
    'Abule Oja Junction',
    CURRENT_DATE + INTERVAL '3 days',
    'available',
    'unverified_new',
    FALSE,
    42
) ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_media (listing_id, media_url, media_type, is_live_upload, sort_order)
VALUES 
    ('l2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', 'image', FALSE, 0)
ON CONFLICT (id) DO NOTHING;

-- Listing 3: Held / Under Inspection Room in Onike
INSERT INTO listings (
    id, agent_id, campus_id, title, description, room_type, 
    price_annual_kobo, landmark_vicinity, move_in_date, 
    availability_status, verification_status, is_boosted, view_count
) VALUES (
    'l3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Modern Shared 2-Bedroom Flat in Onike',
    'Spacious room in a 2-bedroom flat with parlour and kitchen. In high demand. Inspection currently booked.',
    'flat_shared',
    28000000, -- ₦280,000/yr (28,000,000 Kobo)
    'Onike Roundabout',
    CURRENT_DATE + INTERVAL '14 days',
    'held',
    'verified',
    FALSE,
    89
) ON CONFLICT (id) DO NOTHING;

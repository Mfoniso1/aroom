-- ==============================================================================
-- Aroom MVP Pilot: Database Migration Schema
-- Prepared for Supabase / PostgreSQL with PostGIS & pg_trgm
-- Implements Workstreams C, D, E from Aroom MVP Pilot Engineering Brief
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- 2. PARTNERS (Closed Cohort: 15-20 Invite-Only Agents and Landlords)
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text unique not null,
  email text unique,
  role text not null check (role in ('agent', 'landlord', 'admin')),
  agency_name text,
  coverage_areas text[] default array[]::text[],
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended')),
  monthly_quota integer default 15,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PROPERTIES (Permanent Infrastructure: Lodge / Building)
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,                  -- e.g. ARM-CHB-0142
  area_code text not null,                         -- CHB, ALK, DTA, BOC, ALU, OZU
  name text not null,                              -- e.g. Eze Royal Lodge
  landmark text,                                   -- e.g. 5 mins to UNIPORT Choba Gate
  location geography(Point, 4326) not null,
  owner_phone text,
  verification_status text not null default 'pending_mapping'
    check (verification_status in ('draft', 'pending_mapping', 'verified', 'needs_reaudit', 'archived')),
  verified_at timestamptz,
  verified_by uuid references partners(id),
  condition_status text default 'good'             -- good | minor_issues | under_repair
    check (condition_status in ('good', 'minor_issues', 'under_repair')),
  condition_updated_at timestamptz default now(),
  video_url text,
  cover_image_url text,
  merged_into uuid references properties(id),
  created_by uuid references partners(id),
  created_at timestamptz default now()
);

create index if not exists idx_properties_location on properties using gist (location);
create index if not exists idx_properties_name_trgm on properties using gin (name gin_trgm_ops);
create index if not exists idx_properties_public_id on properties (public_id);
create index if not exists idx_properties_status on properties (verification_status);

-- 4. PROPERTY MANAGERS (Ownership and Co-management)
create table if not exists property_managers (
  property_id uuid references properties(id) on delete cascade,
  partner_id uuid references partners(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'co_manager')),
  status text not null default 'active' check (status in ('active', 'pending_approval', 'revoked')),
  created_at timestamptz default now(),
  primary key (property_id, partner_id)
);

-- 5. UNITS (Rooms and Flats within a Lodge)
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  public_id text unique not null,                  -- e.g. ARM-CHB-0142-U4
  unit_label text not null,                        -- e.g. Room 4, Flat B
  room_type text not null                          -- self_contain | single_room | shared_flat
    check (room_type in ('self_contain', 'single_room', 'shared_flat', 'entire_flat')),
  created_at timestamptz default now()
);

create index if not exists idx_units_property on units(property_id);

-- 6. VACANCIES (The Student-Facing Listing Instance)
create table if not exists vacancies (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  status text not null default 'open'
    check (status in ('upcoming', 'open', 'held', 'taken', 'closed')),
  available_from date not null default current_date,
  annual_rent numeric not null check (annual_rent > 0),
  caution_fee numeric default 0 check (caution_fee >= 0),
  legal_fee numeric default 0 check (legal_fee >= 0),
  utility_fee numeric default 0 check (utility_fee >= 0),
  agency_fee_pct numeric not null default 0 check (agency_fee_pct between 0 and 15),
  source text not null default 'partner' check (source in ('partner', 'tenant_declaration')),
  created_by uuid references partners(id),
  created_at timestamptz default now()
);

-- Enforce rule: only one active vacancy per unit
create unique index if not exists one_active_vacancy on vacancies(unit_id)
  where status in ('upcoming', 'open', 'held');

-- 7. CONDITION UPDATES (Audit and freshness of campus lodge conditions)
create table if not exists condition_updates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  reported_by text not null,                       -- partner | student | team_leader
  condition_status text not null check (condition_status in ('good', 'minor_issues', 'under_repair')),
  note text,
  media_url text,
  created_at timestamptz default now()
);

-- 8. BOOKINGS / VIEWING REQUESTS (No inspection fee exists)
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text unique not null,                -- e.g. #ARM-4821
  vacancy_id uuid not null references vacancies(id),
  student_wa_id text not null,
  student_phone text not null,
  partner_id uuid references partners(id),
  slot_date text not null,
  slot_time text not null,
  meeting_point text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'completed', 'expired')),
  partner_confirmed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_bookings_ref on bookings(booking_ref);
create index if not exists idx_bookings_partner on bookings(partner_id);

-- 9. TWILIO WHATSAPP CONCIERGE TABLES
create table if not exists wa_identities (
  id uuid primary key default gen_random_uuid(),
  wa_user_id text unique not null,                 -- Twilio sender ID (whatsapp:+234...)
  phone_e164 text,
  role text default 'student' check (role in ('student', 'partner', 'admin')),
  created_at timestamptz default now()
);

create table if not exists wa_conversations (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references wa_identities(id),
  state text not null default 'IDLE' check (state in ('IDLE', 'COLLECT', 'RESULTS', 'VIEWING_REQUEST', 'CONFIRMED', 'TENANT_DECLARE')),
  context jsonb default '{}'::jsonb,
  last_inbound_at timestamptz default now()
);

create table if not exists wa_messages (
  id uuid primary key default gen_random_uuid(),
  twilio_sid text unique not null,
  conversation_id uuid references wa_conversations(id),
  direction text not null check (direction in ('inbound', 'outbound')),
  body text,
  media jsonb,
  status text default 'received',
  error_code text,
  created_at timestamptz default now()
);

-- 10. TENANT MOVE-OUT DECLARATIONS
create table if not exists tenant_declarations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id),
  identity_id uuid not null references wa_identities(id),
  declared_move_out date not null,
  status text not null default 'pending_confirmation'
    check (status in ('pending_confirmation', 'confirmed', 'declined', 'expired', 'cancelled')),
  confirmed_by uuid references partners(id),
  confirmed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '5 days'),
  created_at timestamptz default now()
);

-- 11. AUDIT LOG (Every state change tracked)
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_name text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_audit_entity on audit_log(entity_name, entity_id);

-- ==============================================================================
-- 12. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table properties enable row level security;
alter table vacancies enable row level security;
alter table units enable row level security;
alter table bookings enable row level security;

-- Ground Rule 2: Hidden until approved. Students/Public can ONLY read verified properties.
create policy "Public can view verified properties"
  on properties for select
  using (verification_status = 'verified' and merged_into is null);

-- Public can view open/upcoming vacancies belonging to verified properties
create policy "Public can view active vacancies of verified properties"
  on vacancies for select
  using (
    status in ('upcoming', 'open', 'held') and
    exists (
      select 1 from units u
      join properties p on p.id = u.property_id
      where u.id = vacancies.unit_id and p.verification_status = 'verified'
    )
  );


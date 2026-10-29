/**
 * pilotAuthStore.ts
 * Direct Supabase (URL + Anon Key) + Local-Storage synchronized store for:
 *  - Unified Auto-Role Login (Team Leader, Agent, Landlord, Student)
 *  - Student registrations & profile management
 *  - Agent & Landlord registrations (NO OTP in pilot; manual Team Leader verification)
 *  - Team Leader Approval / Rejection / Suspension workflow & listing creation guards
 */
import { supabase } from './supabase'

export type PartnerKind = 'agent' | 'landlord'
export type ApprovalStatus = 'invited' | 'approved' | 'suspended' | 'pending' | 'rejected'
export type UserRole = 'student' | 'agent' | 'landlord' | 'admin'

export interface PartnerApplication {
  id: string // agentProfileId
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  password: string
  agentKind: PartnerKind
  agencyName?: string
  idCardImageUrl: string
  coverageAreas: string[]
  propertyTypes?: string[]
  approxUnits?: string
  bio?: string
  status: ApprovalStatus
  phoneContacted: boolean
  rejectionReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  listingCount: number
  verificationRequested?: boolean
  verificationRequestedAt?: string | null
  verificationRequestNote?: string | null
}

export interface StudentAccount {
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  password: string
  campus: string
  matricNumber: string
  avatarUrl?: string
  createdAt: string
}

export interface TeamLeaderProfile {
  userId: string
  fullName: string
  title: string
  email: string
  phoneNumber: string
  whatsappSupport: string
  officeLocation: string
  password: string
}

export interface PilotNotification {
  id: string
  recipientRole: 'admin' | 'partner'
  recipientUserId?: string
  type:
    | 'agent_signup'
    | 'landlord_signup'
    | 'verification_request'
    | 'listing_verification_request'
    | 'approved'
    | 'rejected'
    | 'suspended'
  title: string
  body: string
  applicantId?: string
  listingId?: string
  readAt: string | null
  createdAt: string
}

export interface ActiveSession {
  userId: string
  role: UserRole
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl?: string
  // Student fields
  campus?: string
  matricNumber?: string
  // Partner (Agent / Landlord) fields
  agentProfileId: string | null
  agentKind: PartnerKind | null
  agencyName?: string
  coverageAreas?: string[]
  propertyTypes?: string[]
  approxUnits?: string
  bio?: string
  approvalStatus: ApprovalStatus | null
  rejectionReason: string | null
  verificationRequested?: boolean
  verificationRequestedAt?: string | null
  joinedAt?: string
}

const APPS_KEY = 'aroom_pilot_applications_uniport_v2'
const STUDENTS_KEY = 'aroom_pilot_students_uniport_v2'
const TEAM_LEADER_KEY = 'aroom_pilot_team_leader_uniport_v2'
const NOTIFS_KEY = 'aroom_pilot_notifications_uniport_v2'
const SESSION_KEY = 'aroom_pilot_session_uniport_v2'
export const AUTH_CHANGE_EVENT = 'aroom:auth-changed'

export const TEAM_LEADER_ACCOUNT: TeamLeaderProfile = {
  userId: 'e0000000-0000-0000-0000-000000000001',
  fullName: 'Don-Amadiwochi Eze & Enyinma Justice Smart',
  title: 'Aroom UNIPORT Team Lead & Verification Desk',
  email: 'teamleader@aroom.ng',
  phoneNumber: '+2340000000001',
  whatsappSupport: '+2348099990001',
  officeLocation: 'UNIPORT Operations Hub — Choba Gate & Abuja Campus',
  password: 'TeamLead@12345',
}

const INITIAL_STUDENTS: StudentAccount[] = [
  {
    userId: 'd3333333-3333-3333-3333-333333333333',
    fullName: 'Amara Nwosu',
    email: 'amara.nwosu@uniport.edu.ng',
    phoneNumber: '+2348055556666',
    password: 'Student@12345',
    campus: 'uniport',
    matricNumber: 'U2022/5570042',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    userId: 'd3333333-3333-3333-3333-333333333334',
    fullName: 'Tamunoemi Briggs',
    email: 'tamuno.briggs@uniport.edu.ng',
    phoneNumber: '+2348077778888',
    password: 'Student@12345',
    campus: 'uniport',
    matricNumber: 'U2023/3010118',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
]

const INITIAL_APPLICATIONS: PartnerApplication[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    userId: 'd1111111-1111-1111-1111-111111111111',
    fullName: 'David Opubo',
    email: 'david.opubo@aroomagents.ng',
    phoneNumber: '+2348011112222',
    password: 'Agent@12345',
    agentKind: 'agent',
    agencyName: 'Choba & Alakahia Campus Homes',
    idCardImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    coverageAreas: ['choba', 'alakahia', 'delta_park', 'back_of_chem'],
    bio: 'Verified UNIPORT student housing agent covering Choba Gate, Alakahia (UPTH Road), Delta Park, and Back of Chem. Capped 15% fee & free physical inspections.',
    status: 'approved',
    phoneContacted: true,
    rejectionReason: null,
    reviewedBy: TEAM_LEADER_ACCOUNT.userId,
    reviewedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    listingCount: 4,
    verificationRequested: true,
    verificationRequestedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    userId: 'd2222222-2222-2222-2222-222222222222',
    fullName: 'Tariye Briggs',
    email: 'tariye.briggs@uniportagents.ng',
    phoneNumber: '+2348033334444',
    password: 'Agent@12345',
    agentKind: 'agent',
    agencyName: 'Back of Chem & Ozuoba Student Links',
    idCardImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    coverageAreas: ['back_of_chem', 'ozuoba', 'aluu', 'abuja_campus'],
    bio: 'UNIPORT team field agent specializing in Back of Chem, Abuja Campus Gate, Ozuoba, and Aluu student lodges.',
    status: 'pending',
    phoneContacted: false,
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    listingCount: 0,
    verificationRequested: true,
    verificationRequestedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    verificationRequestNote: 'Ready for Team Lead ID & lodge inspection at Back of Chem / Choba Gate.',
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    userId: 'd4444444-4444-4444-4444-444444444444',
    fullName: 'Chief Emeka Nwosu',
    email: 'emeka.nwosu@directlodge.ng',
    phoneNumber: '+2348022223333',
    password: 'Agent@12345',
    agentKind: 'landlord',
    agencyName: 'Nwosu Executive Student Suites (Choba & Alakahia)',
    idCardImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
    coverageAreas: ['choba', 'alakahia', 'delta_park'],
    propertyTypes: ['Self Contain', 'Shared Flat'],
    approxUnits: '10+ units',
    bio: 'Verified UNIPORT Direct Landlord offering 0% agency fee student apartments with treated borehole water and prepaid meters in Choba and Alakahia.',
    status: 'approved',
    phoneContacted: true,
    rejectionReason: null,
    reviewedBy: TEAM_LEADER_ACCOUNT.userId,
    reviewedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    listingCount: 3,
    verificationRequested: true,
    verificationRequestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    userId: 'd5555555-5555-5555-5555-555555555555',
    fullName: 'Elder Nnamdi Wike',
    email: 'nnamdi.wike@ozuobalodges.ng',
    phoneNumber: '+2348066667777',
    password: 'Agent@12345',
    agentKind: 'landlord',
    agencyName: 'Abuja Campus & Ozuoba Direct Villa',
    idCardImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    coverageAreas: ['ozuoba', 'abuja_campus', 'rumuosi'],
    propertyTypes: ['Self Contain', 'Two Bedroom Flat'],
    approxUnits: '5 - 10 units',
    bio: 'Direct house owner near UNIPORT Abuja Campus Gate and Ozuoba Junction. 0% agency fee.',
    status: 'pending',
    phoneContacted: false,
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    listingCount: 1,
    verificationRequested: false,
    verificationRequestedAt: null,
  },
]

const INITIAL_NOTIFICATIONS: PilotNotification[] = [
  {
    id: 'n1111111-1111-1111-1111-111111111111',
    recipientRole: 'admin',
    type: 'verification_request',
    title: 'UNIPORT Team Agent requested verification',
    body: 'Tariye Briggs (+2348033334444) covering Back of Chem & Ozuoba requested Team Lead verification.',
    applicantId: 'a2222222-2222-2222-2222-222222222222',
    readAt: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'n2222222-2222-2222-2222-222222222222',
    recipientRole: 'admin',
    type: 'listing_verification_request',
    title: 'UNIPORT Lodge awaiting physical verification',
    body: 'David Opubo requested Team Lead physical verification for "Newly Built Self-Contain at Back of Chem" (₦240,000/yr).',
    listingId: 'uniport-3',
    readAt: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
]

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('234')) return `+${digits}`
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`
  return `+${digits}`
}

function loadApps(): PartnerApplication[] {
  try {
    const raw = localStorage.getItem(APPS_KEY)
    if (!raw) {
      localStorage.setItem(APPS_KEY, JSON.stringify(INITIAL_APPLICATIONS))
      return INITIAL_APPLICATIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_APPLICATIONS
  }
}

function saveApps(apps: PartnerApplication[]) {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps))
  } catch {
    // ignore quota error
  }
}

function loadStudents(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY)
    if (!raw) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS))
      return INITIAL_STUDENTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_STUDENTS
  }
}

function saveStudents(students: StudentAccount[]) {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students))
  } catch {
    // ignore
  }
}

export function getTeamLeaderProfile(): TeamLeaderProfile {
  try {
    const raw = localStorage.getItem(TEAM_LEADER_KEY)
    if (!raw) {
      localStorage.setItem(TEAM_LEADER_KEY, JSON.stringify(TEAM_LEADER_ACCOUNT))
      return TEAM_LEADER_ACCOUNT
    }
    return { ...TEAM_LEADER_ACCOUNT, ...JSON.parse(raw) }
  } catch {
    return TEAM_LEADER_ACCOUNT
  }
}

export function updateTeamLeaderProfile(patch: Partial<TeamLeaderProfile>): TeamLeaderProfile {
  const updated = { ...getTeamLeaderProfile(), ...patch }
  try {
    localStorage.setItem(TEAM_LEADER_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
  const session = getCurrentSession()
  if (session && session.role === 'admin') {
    const updatedSession: ActiveSession = {
      ...session,
      fullName: updated.fullName,
      email: updated.email,
      phoneNumber: updated.phoneNumber,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
  }
  emitChange()
  return updated
}

function loadNotifs(): PilotNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY)
    if (!raw) {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS))
      return INITIAL_NOTIFICATIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_NOTIFICATIONS
  }
}

function saveNotifs(items: PilotNotification[]) {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function emitChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

/** Read File as compact data URL for ID card or avatar preview */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image file'))
    reader.readAsDataURL(file)
  })
}

/** Sync local applications with Supabase tables if public.users + public.agent_profiles exist */
export async function syncFromSupabase(): Promise<PartnerApplication[]> {
  const local = loadApps()
  if (!supabase) return local

  try {
    const { data: profiles, error } = await supabase
      .from('agent_profiles')
      .select('*, users!agent_profiles_user_id_fkey(id, phone_number, email, password_hash, account_status)')
      .order('created_at', { ascending: false })

    if (error || !profiles) {
      return local
    }

    const byId = new Map<string, PartnerApplication>()
    for (const item of local) byId.set(item.id, item)

    for (const row of profiles as any[]) {
      const u = row.users || {}
      const existing = byId.get(row.id)
      const status: ApprovalStatus =
        u.account_status === 'active'
          ? 'approved'
          : u.account_status === 'rejected'
          ? 'rejected'
          : u.account_status === 'suspended'
          ? 'suspended'
          : 'pending'

      byId.set(row.id, {
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        email: u.email || existing?.email || '',
        phoneNumber: u.phone_number || existing?.phoneNumber || '',
        password: u.password_hash || existing?.password || 'Agent@12345',
        agentKind: row.agent_kind === 'landlord' ? 'landlord' : 'agent',
        agencyName: row.agency_name || existing?.agencyName,
        idCardImageUrl: row.id_card_image_url || existing?.idCardImageUrl || '',
        coverageAreas: row.coverage_areas || existing?.coverageAreas || [],
        propertyTypes: existing?.propertyTypes,
        approxUnits: existing?.approxUnits,
        bio: existing?.bio,
        status,
        phoneContacted: Boolean(row.phone_contacted),
        rejectionReason: row.rejection_reason || null,
        reviewedBy: row.reviewed_by || null,
        reviewedAt: row.reviewed_at || null,
        createdAt: row.created_at || existing?.createdAt || new Date().toISOString(),
        listingCount: existing?.listingCount ?? 0,
      })
    }

    const merged = Array.from(byId.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    saveApps(merged)
    return merged
  } catch {
    return local
  }
}

/** Register a new Student account and sign them in immediately */
export async function registerStudentAccount(input: {
  fullName: string
  email: string
  phoneNumber: string
  campus: string
  matricNumber: string
  password: string
  avatarUrl?: string
}): Promise<{ student: StudentAccount; session: ActiveSession }> {
  const students = loadStudents()
  const apps = loadApps()
  const normPhone = normalizePhone(input.phoneNumber)
  const normEmail = input.email.trim().toLowerCase()

  if (
    students.some((s) => normalizePhone(s.phoneNumber) === normPhone) ||
    apps.some((a) => normalizePhone(a.phoneNumber) === normPhone)
  ) {
    throw new Error(`Phone number ${input.phoneNumber} is already registered. Please log in instead.`)
  }
  if (
    students.some((s) => s.email.toLowerCase() === normEmail) ||
    apps.some((a) => a.email.toLowerCase() === normEmail)
  ) {
    throw new Error(`Email ${input.email} is already registered. Please log in instead.`)
  }

  const now = new Date().toISOString()
  const newStudent: StudentAccount = {
    userId: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: normEmail,
    phoneNumber: normPhone,
    password: input.password,
    campus: input.campus,
    matricNumber: input.matricNumber.trim().toUpperCase(),
    avatarUrl: input.avatarUrl,
    createdAt: now,
  }

  saveStudents([newStudent, ...students])

  if (supabase) {
    try {
      await supabase.from('users').insert({
        id: newStudent.userId,
        phone_number: newStudent.phoneNumber,
        email: newStudent.email,
        password_hash: newStudent.password,
        user_type: 'student',
        account_status: 'active',
      })
    } catch {
      // ignore if tables not created yet
    }
  }

  const session: ActiveSession = {
    userId: newStudent.userId,
    role: 'student',
    fullName: newStudent.fullName,
    email: newStudent.email,
    phoneNumber: newStudent.phoneNumber,
    avatarUrl: newStudent.avatarUrl,
    campus: newStudent.campus,
    matricNumber: newStudent.matricNumber,
    agentProfileId: null,
    agentKind: null,
    approvalStatus: null,
    rejectionReason: null,
    joinedAt: newStudent.createdAt,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  emitChange()

  return { student: newStudent, session }
}

/** Register a new Agent or Landlord (status = 'pending', notifies Team Leader, syncs to Supabase) */
export async function registerPartnerApplication(input: {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  agentKind: PartnerKind
  agencyName?: string
  idCardImageUrl: string
  coverageAreas: string[]
  propertyTypes?: string[]
  approxUnits?: string
}): Promise<{ application: PartnerApplication; session: ActiveSession }> {
  const apps = loadApps()
  const students = loadStudents()
  const normPhone = normalizePhone(input.phoneNumber)
  const normEmail = input.email.trim().toLowerCase()

  const duplicatePhone =
    apps.find((a) => normalizePhone(a.phoneNumber) === normPhone) ||
    students.find((s) => normalizePhone(s.phoneNumber) === normPhone)
  if (duplicatePhone) {
    throw new Error(`Phone number ${input.phoneNumber} is already registered. Please log in instead.`)
  }
  const duplicateEmail =
    apps.find((a) => a.email.toLowerCase() === normEmail) ||
    students.find((s) => s.email.toLowerCase() === normEmail)
  if (duplicateEmail) {
    throw new Error(`Email ${input.email} is already registered. Please log in instead.`)
  }

  const userId = crypto.randomUUID()
  const profileId = crypto.randomUUID()
  const now = new Date().toISOString()

  const newApp: PartnerApplication = {
    id: profileId,
    userId,
    fullName: input.fullName.trim(),
    email: normEmail,
    phoneNumber: normPhone,
    password: input.password,
    agentKind: input.agentKind,
    agencyName: input.agencyName?.trim() || undefined,
    idCardImageUrl: input.idCardImageUrl,
    coverageAreas: input.coverageAreas,
    propertyTypes: input.propertyTypes,
    approxUnits: input.approxUnits,
    status: 'pending',
    phoneContacted: false,
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: now,
    listingCount: 0,
  }

  // 1. Save locally immediately
  const updatedApps = [newApp, ...apps]
  saveApps(updatedApps)

  // 2. Create Team Leader notification
  const newNotif: PilotNotification = {
    id: crypto.randomUUID(),
    recipientRole: 'admin',
    type: input.agentKind === 'landlord' ? 'landlord_signup' : 'agent_signup',
    title: `New ${input.agentKind === 'landlord' ? 'Landlord' : 'Agent'} awaiting approval`,
    body: `${newApp.fullName} (${newApp.phoneNumber}) signed up as a ${newApp.agentKind} and submitted an ID card for verification.`,
    applicantId: newApp.id,
    readAt: null,
    createdAt: now,
  }
  saveNotifs([newNotif, ...loadNotifs()])

  // 3. Push to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('users').insert({
        id: userId,
        phone_number: normPhone,
        email: normEmail,
        password_hash: input.password,
        user_type: 'agent',
        account_status: 'pending_verification',
      })
      await supabase.from('agent_profiles').insert({
        id: profileId,
        user_id: userId,
        full_name: newApp.fullName,
        agency_name: newApp.agencyName || null,
        id_card_image_url: newApp.idCardImageUrl,
        is_phone_verified: false,
        agent_kind: newApp.agentKind,
        coverage_areas: newApp.coverageAreas,
        phone_contacted: false,
      })
      await supabase.from('notifications').insert({
        id: newNotif.id,
        recipient_user_id: TEAM_LEADER_ACCOUNT.userId,
        type: newNotif.type,
        title: newNotif.title,
        body: newNotif.body,
        payload: { agentProfileId: profileId, userId, agentKind: newApp.agentKind },
      })
    } catch {
      // Tables may not be created yet; local store keeps working
    }
  }

  // 4. Sign in the applicant into their pending session
  const session: ActiveSession = {
    userId: newApp.userId,
    role: newApp.agentKind,
    fullName: newApp.fullName,
    email: newApp.email,
    phoneNumber: newApp.phoneNumber,
    agentProfileId: newApp.id,
    agentKind: newApp.agentKind,
    agencyName: newApp.agencyName,
    coverageAreas: newApp.coverageAreas,
    propertyTypes: newApp.propertyTypes,
    approxUnits: newApp.approxUnits,
    approvalStatus: 'pending',
    rejectionReason: null,
    joinedAt: newApp.createdAt,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  emitChange()

  return { application: newApp, session }
}

/**
 * Unified Login with Automatic Role Resolution:
 * Checks Team Leader -> Registered Agents & Landlords -> Registered Students.
 * Everyone logs in from the same screen without picking a role tab first.
 */
export async function loginPilotUser(
  identifier: string,
  password: string,
  preferredRole?: UserRole
): Promise<ActiveSession> {
  await syncFromSupabase()

  const clean = identifier.trim()
  const isEmail = clean.includes('@')
  const normPhone = isEmail ? '' : normalizePhone(clean)
  const tl = getTeamLeaderProfile()

  // 1. Check Team Leader credentials
  const matchesTeamLeader =
    clean.toLowerCase() === tl.email.toLowerCase() ||
    clean.toLowerCase() === TEAM_LEADER_ACCOUNT.email.toLowerCase() ||
    normPhone === normalizePhone(tl.phoneNumber) ||
    normPhone === TEAM_LEADER_ACCOUNT.phoneNumber

  if (matchesTeamLeader) {
    if (password === tl.password || password === TEAM_LEADER_ACCOUNT.password) {
      const session: ActiveSession = {
        userId: tl.userId,
        role: 'admin',
        fullName: tl.fullName,
        email: tl.email,
        phoneNumber: tl.phoneNumber,
        agentProfileId: null,
        agentKind: null,
        approvalStatus: 'approved',
        rejectionReason: null,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      emitChange()
      return session
    }
    throw new Error('Incorrect password for Team Leader account.')
  }

  // 2. Check registered Agents & Landlords
  const apps = loadApps()
  const partnerMatch = apps.find((a) =>
    isEmail ? a.email.toLowerCase() === clean.toLowerCase() : normalizePhone(a.phoneNumber) === normPhone
  )

  if (partnerMatch) {
    if (partnerMatch.password !== password) {
      throw new Error('Incorrect email/phone or password.')
    }
    const session: ActiveSession = {
      userId: partnerMatch.userId,
      role: partnerMatch.agentKind,
      fullName: partnerMatch.fullName,
      email: partnerMatch.email,
      phoneNumber: partnerMatch.phoneNumber,
      agentProfileId: partnerMatch.id,
      agentKind: partnerMatch.agentKind,
      agencyName: partnerMatch.agencyName,
      coverageAreas: partnerMatch.coverageAreas,
      propertyTypes: partnerMatch.propertyTypes,
      approxUnits: partnerMatch.approxUnits,
      bio: partnerMatch.bio,
      approvalStatus: partnerMatch.status,
      rejectionReason: partnerMatch.rejectionReason,
      joinedAt: partnerMatch.createdAt,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    emitChange()
    return session
  }

  // 3. Check registered Students
  const students = loadStudents()
  const studentMatch = students.find((s) =>
    isEmail ? s.email.toLowerCase() === clean.toLowerCase() : normalizePhone(s.phoneNumber) === normPhone
  )

  if (studentMatch) {
    if (studentMatch.password !== password) {
      throw new Error('Incorrect email/phone or password.')
    }
    const session: ActiveSession = {
      userId: studentMatch.userId,
      role: 'student',
      fullName: studentMatch.fullName,
      email: studentMatch.email,
      phoneNumber: studentMatch.phoneNumber,
      avatarUrl: studentMatch.avatarUrl,
      campus: studentMatch.campus,
      matricNumber: studentMatch.matricNumber,
      agentProfileId: null,
      agentKind: null,
      approvalStatus: null,
      rejectionReason: null,
      joinedAt: studentMatch.createdAt,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    emitChange()
    return session
  }

  // 4. Fallback if preferredRole === 'student' for quick demo testing
  if (preferredRole === 'student') {
    const demo = students[0] || INITIAL_STUDENTS[0]
    const session: ActiveSession = {
      userId: demo.userId,
      role: 'student',
      fullName: demo.fullName,
      email: demo.email,
      phoneNumber: demo.phoneNumber,
      campus: demo.campus,
      matricNumber: demo.matricNumber,
      agentProfileId: null,
      agentKind: null,
      approvalStatus: null,
      rejectionReason: null,
      joinedAt: demo.createdAt,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    emitChange()
    return session
  }

  throw new Error('No account found with that email or phone number. Please check your details or create an account.')
}

/** Update the currently logged-in user's profile (Student, Agent, or Landlord) */
export async function updateCurrentUserProfile(patch: {
  fullName?: string
  phoneNumber?: string
  campus?: string
  matricNumber?: string
  avatarUrl?: string
  agencyName?: string
  coverageAreas?: string[]
  bio?: string
}): Promise<ActiveSession> {
  const session = getCurrentSession()
  if (!session) throw new Error('No active session')

  const normPhone = patch.phoneNumber ? normalizePhone(patch.phoneNumber) : session.phoneNumber

  if (session.role === 'student') {
    const students = loadStudents()
    const idx = students.findIndex((s) => s.userId === session.userId)
    if (idx !== -1) {
      students[idx] = {
        ...students[idx],
        fullName: patch.fullName?.trim() || students[idx].fullName,
        phoneNumber: normPhone,
        campus: patch.campus ?? students[idx].campus,
        matricNumber: patch.matricNumber?.trim().toUpperCase() ?? students[idx].matricNumber,
        avatarUrl: patch.avatarUrl ?? students[idx].avatarUrl,
      }
      saveStudents(students)
    }
  } else if (session.agentProfileId) {
    const apps = loadApps()
    const idx = apps.findIndex((a) => a.id === session.agentProfileId)
    if (idx !== -1) {
      apps[idx] = {
        ...apps[idx],
        fullName: patch.fullName?.trim() || apps[idx].fullName,
        phoneNumber: normPhone,
        agencyName: patch.agencyName !== undefined ? patch.agencyName.trim() : apps[idx].agencyName,
        coverageAreas: patch.coverageAreas ?? apps[idx].coverageAreas,
        bio: patch.bio !== undefined ? patch.bio.trim() : apps[idx].bio,
      }
      saveApps(apps)

      if (supabase) {
        try {
          await supabase
            .from('agent_profiles')
            .update({
              full_name: apps[idx].fullName,
              agency_name: apps[idx].agencyName || null,
              coverage_areas: apps[idx].coverageAreas,
            })
            .eq('id', apps[idx].id)
        } catch {
          // ignore
        }
      }
    }
  }

  const updatedSession: ActiveSession = {
    ...session,
    fullName: patch.fullName?.trim() || session.fullName,
    phoneNumber: normPhone,
    campus: patch.campus ?? session.campus,
    matricNumber: patch.matricNumber?.trim().toUpperCase() ?? session.matricNumber,
    avatarUrl: patch.avatarUrl ?? session.avatarUrl,
    agencyName: patch.agencyName !== undefined ? patch.agencyName.trim() : session.agencyName,
    coverageAreas: patch.coverageAreas ?? session.coverageAreas,
    bio: patch.bio !== undefined ? patch.bio.trim() : session.bio,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
  emitChange()
  return updatedSession
}

/** Get the current session (refreshed against latest approval status & profile fields) */
export function getCurrentSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as ActiveSession
    if (session.agentProfileId) {
      const latest = loadApps().find((a) => a.id === session.agentProfileId)
      if (latest) {
        session.fullName = latest.fullName
        session.phoneNumber = latest.phoneNumber
        session.agencyName = latest.agencyName
        session.coverageAreas = latest.coverageAreas
        session.bio = latest.bio
        session.approvalStatus = latest.status
        session.rejectionReason = latest.rejectionReason
        session.verificationRequested = latest.verificationRequested
        session.verificationRequestedAt = latest.verificationRequestedAt
      }
    } else if (session.role === 'student') {
      const latestStudent = loadStudents().find((s) => s.userId === session.userId)
      if (latestStudent) {
        session.fullName = latestStudent.fullName
        session.phoneNumber = latestStudent.phoneNumber
        session.campus = latestStudent.campus
        session.matricNumber = latestStudent.matricNumber
        session.avatarUrl = latestStudent.avatarUrl
      }
    }
    return session
  } catch {
    return null
  }
}

export function listStudentAccounts(): StudentAccount[] {
  return loadStudents()
}

export function logoutPilotUser() {
  localStorage.removeItem(SESSION_KEY)
  emitChange()
}

/**
 * Allows any Agent or Landlord within the UNIPORT team to send a verification request
 * directly to the Aroom Team Lead for their account/ID & field inspection.
 */
export async function requestPartnerVerification(
  applicantId: string,
  note?: string
): Promise<PartnerApplication> {
  const apps = loadApps()
  const idx = apps.findIndex((a) => a.id === applicantId)
  if (idx === -1) throw new Error('Partner profile not found')

  const now = new Date().toISOString()
  const updated: PartnerApplication = {
    ...apps[idx],
    verificationRequested: true,
    verificationRequestedAt: now,
    verificationRequestNote: note?.trim() || 'Requested Team Lead verification for UNIPORT student housing.',
  }
  apps[idx] = updated
  saveApps(apps)

  const newNotif: PilotNotification = {
    id: crypto.randomUUID(),
    recipientRole: 'admin',
    type: 'verification_request',
    title: `Team ${updated.agentKind === 'landlord' ? 'Landlord' : 'Agent'} requested verification`,
    body: `${updated.fullName} (${updated.phoneNumber}) requested Aroom Team Lead verification${
      note?.trim() ? `: "${note.trim()}"` : '.'
    }`,
    applicantId: updated.id,
    readAt: null,
    createdAt: now,
  }
  saveNotifs([newNotif, ...loadNotifs()])

  const session = getCurrentSession()
  if (session && session.agentProfileId === updated.id) {
    session.verificationRequested = true
    session.verificationRequestedAt = now
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  emitChange()
  return updated
}

/**
 * Sends a notification to the Aroom Team Lead when a team agent or landlord
 * requests physical verification for a specific UNIPORT lodge listing.
 */
export function notifyTeamLeadForListingVerification(input: {
  listingId: string
  listingTitle: string
  landmark: string
  requesterName: string
  note?: string
}) {
  const now = new Date().toISOString()
  const newNotif: PilotNotification = {
    id: crypto.randomUUID(),
    recipientRole: 'admin',
    type: 'listing_verification_request',
    title: 'UNIPORT Lodge Verification Request',
    body: `${input.requesterName} requested Team Lead physical verification for "${input.listingTitle}" (${input.landmark})${
      input.note?.trim() ? ` — ${input.note.trim()}` : '.'
    }`,
    listingId: input.listingId,
    readAt: null,
    createdAt: now,
  }
  saveNotifs([newNotif, ...loadNotifs()])
  emitChange()
}

/** Team Leader actions */
export async function listPartnerApplications(
  filter: ApprovalStatus | 'all' = 'all'
): Promise<{
  counts: Record<ApprovalStatus, number>
  items: PartnerApplication[]
}> {
  const all = await syncFromSupabase()
  const counts: Record<ApprovalStatus, number> = {
    invited: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  }
  for (const a of all) counts[a.status] = (counts[a.status] || 0) + 1
  const items = filter === 'all' ? all : all.filter((a) => a.status === filter)
  return { counts, items }
}

export async function updatePartnerApproval(
  applicantId: string,
  action: 'approve' | 'reject' | 'suspend' | 'reinstate',
  options?: { reason?: string; phoneContacted?: boolean }
): Promise<PartnerApplication> {
  const apps = loadApps()
  const idx = apps.findIndex((a) => a.id === applicantId)
  if (idx === -1) throw new Error('Applicant not found')

  const current = apps[idx]
  const now = new Date().toISOString()
  const nextStatus: ApprovalStatus =
    action === 'approve' || action === 'reinstate'
      ? 'approved'
      : action === 'reject'
      ? 'rejected'
      : 'suspended'

  const updated: PartnerApplication = {
    ...current,
    status: nextStatus,
    phoneContacted: options?.phoneContacted !== undefined ? options.phoneContacted : current.phoneContacted || nextStatus === 'approved',
    rejectionReason: action === 'reject' || action === 'suspend' ? options?.reason || 'Not approved during verification' : null,
    reviewedBy: TEAM_LEADER_ACCOUNT.userId,
    reviewedAt: now,
  }

  apps[idx] = updated
  saveApps(apps)

  // Sync to Supabase if tables exist
  if (supabase) {
    try {
      const dbAccountStatus =
        nextStatus === 'approved'
          ? 'active'
          : nextStatus === 'rejected'
          ? 'rejected'
          : 'suspended'
      await supabase
        .from('users')
        .update({ account_status: dbAccountStatus, updated_at: now })
        .eq('id', updated.userId)
      await supabase
        .from('agent_profiles')
        .update({
          is_phone_verified: nextStatus === 'approved',
          phone_contacted: updated.phoneContacted,
          rejection_reason: updated.rejectionReason,
          reviewed_by: TEAM_LEADER_ACCOUNT.userId,
          reviewed_at: now,
        })
        .eq('id', updated.id)
    } catch {
      // ignore if tables not initialized yet
    }
  }

  // Refresh session if the affected user is currently logged in
  const session = getCurrentSession()
  if (session && session.agentProfileId === updated.id) {
    session.approvalStatus = updated.status
    session.rejectionReason = updated.rejectionReason
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  emitChange()
  return updated
}

export async function togglePartnerPhoneContacted(applicantId: string, value: boolean): Promise<PartnerApplication> {
  const apps = loadApps()
  const idx = apps.findIndex((a) => a.id === applicantId)
  if (idx === -1) throw new Error('Applicant not found')
  apps[idx] = { ...apps[idx], phoneContacted: value }
  saveApps(apps)

  if (supabase) {
    try {
      await supabase.from('agent_profiles').update({ phone_contacted: value }).eq('id', applicantId)
    } catch {
      // ignore
    }
  }
  emitChange()
  return apps[idx]
}

/** Team Leader directly registers a pre-approved Agent or Landlord */
export async function createPreApprovedPartner(input: {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  agentKind: PartnerKind
  agencyName?: string
  coverageAreas?: string[]
}): Promise<PartnerApplication> {
  const apps = loadApps()
  const normPhone = normalizePhone(input.phoneNumber)
  const normEmail = input.email.trim().toLowerCase()

  if (apps.some((a) => normalizePhone(a.phoneNumber) === normPhone)) {
    throw new Error(`Phone number ${input.phoneNumber} is already registered.`)
  }
  if (apps.some((a) => a.email.toLowerCase() === normEmail)) {
    throw new Error(`Email ${input.email} is already registered.`)
  }

  const now = new Date().toISOString()
  const newApp: PartnerApplication = {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: normEmail,
    phoneNumber: normPhone,
    password: input.password,
    agentKind: input.agentKind,
    agencyName: input.agencyName?.trim() || undefined,
    idCardImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    coverageAreas: input.coverageAreas || ['choba', 'alakahia'],
    status: 'approved',
    phoneContacted: true,
    rejectionReason: null,
    reviewedBy: TEAM_LEADER_ACCOUNT.userId,
    reviewedAt: now,
    createdAt: now,
    listingCount: 0,
  }

  saveApps([newApp, ...apps])

  if (supabase) {
    try {
      await supabase.from('users').insert({
        id: newApp.userId,
        phone_number: newApp.phoneNumber,
        email: newApp.email,
        password_hash: newApp.password,
        user_type: 'agent',
        account_status: 'active',
      })
      await supabase.from('agent_profiles').insert({
        id: newApp.id,
        user_id: newApp.userId,
        full_name: newApp.fullName,
        agency_name: newApp.agencyName || null,
        id_card_image_url: newApp.idCardImageUrl,
        is_phone_verified: true,
        agent_kind: newApp.agentKind,
        coverage_areas: newApp.coverageAreas,
        phone_contacted: true,
        reviewed_by: TEAM_LEADER_ACCOUNT.userId,
        reviewed_at: now,
      })
    } catch {
      // ignore
    }
  }

  emitChange()
  return newApp
}

export function getTeamLeaderNotifications(): { unreadCount: number; items: PilotNotification[] } {
  const items = loadNotifs().filter((n) => n.recipientRole === 'admin')
  return {
    unreadCount: items.filter((n) => !n.readAt).length,
    items,
  }
}

export function markAllTeamLeaderNotificationsRead() {
  const now = new Date().toISOString()
  const updated = loadNotifs().map((n) => (n.recipientRole === 'admin' && !n.readAt ? { ...n, readAt: now } : n))
  saveNotifs(updated)
  emitChange()
}

export function getDashboardPathForSession(session: ActiveSession | null): string {
  if (!session) return '/login'
  if (session.role === 'admin') return '/admin'
  if (session.role === 'student') return '/student/dashboard'
  if (session.approvalStatus && session.approvalStatus !== 'approved') return '/portal/status'
  if (session.agentKind === 'landlord' || session.role === 'landlord') return '/portal/landlord/dashboard'
  return '/portal/dashboard'
}

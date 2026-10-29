/**
 * whatsappAiConcierge.ts
 * Twilio WhatsApp + OpenRouter Conversational AI Student Housing & Trusted Agent Concierge Engine.
 *
 * Capabilities (100% inside WhatsApp — no website visit required):
 *  1. Natural multi-turn conversation (English & Nigerian Pidgin) powered by OpenRouter AI on Supabase
 *  2. Find Team-Leader-Approved Trusted Agents & Landlords by campus/area (strictly status === 'approved')
 *  3. Browse available houses & transparent Move-In Cost Breakdowns (Rent + Caution + Legal + Utility + Agency)
 *  4. Book a Verified Agent for a FREE physical walkthrough directly during the conversation
 *  5. Generate Twilio TwiML XML responses & sync bookings to Supabase + Team Leader Command Center
 */
import { supabase } from './supabase'
import {
  listPartnerApplications,
  getTeamLeaderProfile,
  type PartnerApplication,
} from './pilotAuthStore'
import { SEED_LISTINGS } from './listingsStore'
import { CAMPUSES } from './campuses'
import { AGENT_LOCATIONS } from './agentLocations'
import type { Listing } from '@/components/shared/ListingCard'

export const WHATSAPP_BOOKING_EVENT = 'aroom:whatsapp-booking-changed'
const BOOKINGS_KEY = 'aroom_whatsapp_agent_bookings_v1'
const TWILIO_CONFIG_KEY = 'aroom_twilio_ai_config_v1'

export interface ListingCostBreakdown {
  annualRent: number
  cautionFee: number
  legalFee: number
  utilityFee: number
  agencyFee: number
  inspectionFee: number
  totalMoveInCost: number
  isDirectLandlord: boolean
}

export interface EnrichedWhatsAppListing {
  indexCode: string // e.g. "#1", "#2"
  listing: Listing
  campusName: string
  campusShort: string
  costs: ListingCostBreakdown
  verifiedAgent: PartnerApplication | null
  agentCode: string // e.g. "A1"
}

export type InspectionBookingStatus =
  | 'pending_agent'      // Default when student creates booking
  | 'confirmed'          // Agent or Team Leader confirmed slot
  | 'reschedule_needed'  // Agent proposed a different time
  | 'completed'          // Walkthrough happened
  | 'reported_issue'     // Student reported no-show or fee extortion
  | 'cancelled'

export interface WhatsAppAgentBooking {
  id: string
  bookingRef: string
  referenceCode?: string // alias for bookingRef
  studentPhone: string
  studentName: string
  agentProfileId: string
  agentId?: string // alias for agentProfileId
  agentName: string
  agentPhone: string
  agentKind: 'agent' | 'landlord'
  agencyName?: string
  listingId?: string
  houseId?: string // alias for listingId
  listingTitle: string
  houseTitle?: string // alias for listingTitle
  landmark: string
  meetupLandmark: string // REQUIRED: Public landmark, never private alley
  totalMoveInCost: number
  preferredSlot: string
  status: InspectionBookingStatus
  createdAt: string
}

export type WhatsAppInspectionBooking = WhatsAppAgentBooking

export interface TwilioAiConfig {
  twilioAccountSid: string
  twilioWhatsAppNumber: string
  webhookUrl: string
  aiProvider: 'supabase_openrouter' | 'openrouter_direct' | 'smart_campus_nlu'
  openRouterModel: string
  aiApiKey: string
}

export interface WhatsAppConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface WhatsAppBotReply {
  id: string
  sender: 'bot' | 'student'
  text: string
  mediaUrl?: string
  mediaCaption?: string
  twimlXml: string
  suggestedReplies: string[]
  bookingCreated?: WhatsAppAgentBooking
  aiEngineUsed?: string
  timestamp: string
}

const supabaseUrlFromEnv = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || 'https://azqqlvdruujrfwtvjvwr.supabase.co'
const openRouterKeyFromEnv = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined)?.trim() || ''

const DEFAULT_TWILIO_CONFIG: TwilioAiConfig = {
  twilioAccountSid: 'AC_AROOM_PILOT_SANDBOX',
  twilioWhatsAppNumber: 'whatsapp:+14155238886',
  webhookUrl: `${supabaseUrlFromEnv.replace(/\/$/, '')}/functions/v1/whatsapp-ai-webhook`,
  aiProvider: 'supabase_openrouter',
  openRouterModel: 'openai/gpt-4o-mini',
  aiApiKey: openRouterKeyFromEnv,
}

const INITIAL_BOOKINGS: WhatsAppAgentBooking[] = []

export const STUDENT_IDENTITY_EVENT = 'aroom:student-identity-changed'

export interface StudentChatIdentity {
  name: string
  phone: string
}

export function getStudentChatIdentity(
  session?: { fullName?: string; phoneNumber?: string } | null
): StudentChatIdentity {
  const storedName =
    typeof localStorage !== 'undefined' ? localStorage.getItem('aroom_student_name') || '' : ''
  const storedPhone =
    typeof localStorage !== 'undefined' ? localStorage.getItem('aroom_student_phone') || '' : ''
  return {
    name: (session?.fullName || storedName).trim(),
    phone: (session?.phoneNumber || storedPhone).trim(),
  }
}

export function saveStudentChatIdentity(patch: Partial<StudentChatIdentity>): StudentChatIdentity {
  if (typeof localStorage !== 'undefined') {
    if (patch.name !== undefined) {
      const cleanName = patch.name.trim()
      if (cleanName) {
        localStorage.setItem('aroom_student_name', cleanName)
      } else {
        localStorage.removeItem('aroom_student_name')
      }
    }
    if (patch.phone !== undefined) {
      const cleanPhone = patch.phone.trim()
      if (cleanPhone) {
        localStorage.setItem('aroom_student_phone', cleanPhone)
      } else {
        localStorage.removeItem('aroom_student_phone')
      }
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STUDENT_IDENTITY_EVENT))
  }
  return getStudentChatIdentity()
}

export function getTwilioAiConfig(): TwilioAiConfig {
  try {
    const raw = localStorage.getItem(TWILIO_CONFIG_KEY)
    if (!raw) return DEFAULT_TWILIO_CONFIG
    return { ...DEFAULT_TWILIO_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_TWILIO_CONFIG
  }
}

export function saveTwilioAiConfig(patch: Partial<TwilioAiConfig>): TwilioAiConfig {
  const updated = { ...getTwilioAiConfig(), ...patch }
  try {
    localStorage.setItem(TWILIO_CONFIG_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
  return updated
}

export function listWhatsAppBookings(): WhatsAppAgentBooking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS))
      return INITIAL_BOOKINGS
    }
    const parsed: WhatsAppAgentBooking[] = JSON.parse(raw)
    // Purge legacy hardcoded 'Amara Nwosu' demo seed booking if present
    const cleaned = parsed.filter((b) => b.id !== 'wb-1001' && b.studentName !== 'Amara Nwosu')
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(cleaned))
    }
    return cleaned
  } catch {
    return INITIAL_BOOKINGS
  }
}

function saveWhatsAppBookings(items: WhatsAppAgentBooking[]) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(WHATSAPP_BOOKING_EVENT))
}

export function computeListingCosts(listing: Listing): ListingCostBreakdown {
  const isDirectLandlord = listing.uploaderType === 'landlord'
  const annualRent = listing.price
  const cautionFee = listing.customFees?.cautionFee ?? 25000
  const legalFee = listing.customFees?.legalFee ?? 15000
  const utilityFee = listing.customFees?.utilityFee ?? 10000
  const agencyFee = isDirectLandlord
    ? 0
    : listing.customFees?.agencyFee ?? Math.round(annualRent * 0.15)
  const inspectionFee = 0 // Free physical inspection with Team Leader verified agents

  return {
    annualRent,
    cautionFee,
    legalFee,
    utilityFee,
    agencyFee,
    inspectionFee,
    totalMoveInCost: annualRent + cautionFee + legalFee + utilityFee + agencyFee,
    isDirectLandlord,
  }
}

/**
 * Strictly returns ONLY Agents & Landlords approved by the Team Leader.
 * Pending, rejected, or suspended applicants are never exposed on WhatsApp.
 */
export async function getVerifiedWhatsAppCatalog(): Promise<{
  approvedAgents: Array<{ code: string; partner: PartnerApplication; areaLabels: string[] }>
  availableHouses: EnrichedWhatsAppListing[]
}> {
  const { items: approvedPartners } = await listPartnerApplications('approved')
  const approvedAgents = approvedPartners.map((partner, idx) => ({
    code: `A${idx + 1}`,
    partner,
    areaLabels: partner.coverageAreas.map(
      (id) => AGENT_LOCATIONS.find((l) => l.id === id)?.label || id
    ),
  }))

  const activeListings = SEED_LISTINGS.filter((l) => l.availabilityStatus === 'available')

  const availableHouses: EnrichedWhatsAppListing[] = activeListings.map((listing, idx) => {
    const campusObj = CAMPUSES.find((c) => c.id === listing.campusId)
    const matchedAgentEntry =
      approvedAgents.find(
        (a) =>
          a.partner.agentKind === listing.uploaderType &&
          a.partner.coverageAreas.some((area) =>
            area.startsWith(listing.campusId || 'uniport')
          )
      ) ||
      approvedAgents.find((a) => a.partner.agentKind === listing.uploaderType) ||
      approvedAgents[0]

    return {
      indexCode: `#${idx + 1}`,
      listing,
      campusName: campusObj?.name || 'University of Port Harcourt (UNIPORT)',
      campusShort: campusObj?.shortCode || 'UNIPORT',
      costs: computeListingCosts(listing),
      verifiedAgent: matchedAgentEntry?.partner || null,
      agentCode: matchedAgentEntry?.code || 'A1',
    }
  })

  return { approvedAgents, availableHouses }
}

/** Nigerian phone number validator */
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '')
  return /^(?:0|234)(?:70|80|81|90|91)\d{8}$/.test(cleaned)
}

/** Extract first Nigerian phone number token from free text */
export function extractNigerianPhone(text: string): string | null {
  const cleaned = text.replace(/[\s\-()]/g, '')
  const match = cleaned.match(/(?:\+?234|0)(?:70|80|81|90|91)\d{8}\b/)
  return match ? match[0] : null
}

/** Extract student's real name from natural self-introduction or "Name 0803XXXXXXX" reply */
export function extractStudentNameFromText(text: string): string | null {
  // 1. Explicit self-introduction ("My name is Chidi", "I'm Tobi", "I am Kemi", "Call me Nnamdi")
  const introMatch = text.match(
    /(?:my name is|i am|i'm|call me|name\s*[:=-])\s*([A-Za-z]{2,20}(?:\s+[A-Za-z]{2,20})?)/i
  )
  if (introMatch) {
    const candidate = introMatch[1].trim()
    if (
      !/^(looking|searching|schooling|in|at|from|interested|ready|here|a|an|student|booking|new|under|around|near)\b/i.test(
        candidate
      )
    ) {
      return candidate
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
  }

  // 2. Name paired alongside a Nigerian phone number (e.g., "Chidi 08031234567" or "08031234567 Chidi")
  if (extractNigerianPhone(text)) {
    const withoutPhone = text
      .replace(/(?:\+?234|0)(?:70|80|81|90|91)\d{8}/g, '')
      .replace(/[^A-Za-z\s]/g, ' ')
      .trim()
    const stopWords = new Set([
      'my',
      'number',
      'phone',
      'whatsapp',
      'is',
      'its',
      'it',
      'here',
      'abeg',
      'please',
      'book',
      'for',
      'me',
      'yes',
      'hi',
      'hello',
      'name',
      'and',
      'call',
    ])
    const nameTokens = withoutPhone
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w.toLowerCase()))
    if (nameTokens.length >= 1 && nameTokens.length <= 3) {
      return nameTokens
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
  }

  return null
}

/** Returns clean first name, or empty string if unknown/generic */
export function getCleanFirstName(fullName?: string): string {
  const clean = (fullName || '').trim()
  if (
    !clean ||
    /^(guest|student|campus student|whatsapp student|there|anonymous|user)$/i.test(clean)
  ) {
    return ''
  }
  return clean.split(/\s+/)[0]
}

/** Create a WhatsApp Agent Inspection Booking (defaults to 'pending_agent') and sync to Supabase */
export async function createWhatsAppAgentBooking(input: {
  studentPhone: string
  studentName: string
  partner: PartnerApplication
  house?: EnrichedWhatsAppListing
  preferredSlot: string
  customBookingRef?: string
  status?: InspectionBookingStatus
  meetupLandmark?: string
}): Promise<WhatsAppAgentBooking> {
  const bookingRef = input.customBookingRef || `ARM-${Math.floor(1000 + Math.random() * 9000)}`
  const now = new Date().toISOString()
  const publicMeetup =
    input.meetupLandmark ||
    input.house?.listing.survivalMetrics?.nearestLandmark ||
    input.house?.listing.landmark ||
    input.partner.coverageAreas
      .map((id) => AGENT_LOCATIONS.find((l) => l.id === id)?.label || id)
      .join(', ') ||
    'UNIPORT Choba Gate Main Security Post'

  const newBooking: WhatsAppAgentBooking = {
    id: crypto.randomUUID(),
    bookingRef,
    referenceCode: bookingRef,
    studentPhone: input.studentPhone,
    studentName: input.studentName || 'WhatsApp Student',
    agentProfileId: input.partner.id,
    agentId: input.partner.id,
    agentName: input.partner.fullName,
    agentPhone: input.partner.phoneNumber,
    agentKind: input.partner.agentKind,
    agencyName: input.partner.agencyName,
    listingId: input.house?.listing.id,
    houseId: input.house?.listing.id,
    listingTitle:
      input.house?.listing.title ||
      `Campus Walkthrough with ${input.partner.fullName}`,
    houseTitle:
      input.house?.listing.title ||
      `Campus Walkthrough with ${input.partner.fullName}`,
    landmark: input.house?.listing.landmark || publicMeetup,
    meetupLandmark: publicMeetup,
    totalMoveInCost: input.house?.costs.totalMoveInCost || 0,
    preferredSlot: input.preferredSlot,
    status: input.status || 'pending_agent',
    createdAt: now,
  }

  const existing = listWhatsAppBookings()
  if (!existing.some((b) => b.bookingRef === bookingRef)) {
    saveWhatsAppBookings([newBooking, ...existing])
  }

  if (supabase) {
    try {
      await supabase.from('whatsapp_bookings').insert({
        id: newBooking.id,
        booking_ref: newBooking.bookingRef,
        student_phone: newBooking.studentPhone,
        student_name: newBooking.studentName,
        agent_profile_id: newBooking.agentProfileId,
        listing_title: newBooking.listingTitle,
        preferred_slot: newBooking.preferredSlot,
        total_move_in_kobo: newBooking.totalMoveInCost * 100,
        status: newBooking.status,
      })
    } catch {
      // Table may not be created yet; localStorage keeps working
    }
  }

  return newBooking
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function buildTwimlXml(body: string, mediaUrl?: string): string {
  const mediaTag = mediaUrl ? `\n    <Media>${escapeXml(mediaUrl)}</Media>` : ''
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>\n    <Body>${escapeXml(body)}</Body>${mediaTag}\n  </Message>\n</Response>`
}

export function parseMaxBudget(rawMessage: string): number | null {
  // 1. Strip house codes (#1), agent codes (A1), times (2pm), and durations (1 year)
  const sanitized = rawMessage
    .toLowerCase()
    .replace(/#\d+/g, '')
    .replace(/\ba\d+\b/g, '')
    .replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/g, '')
    .replace(/\b\d+\s*(?:year|yr|month|day|week)s?\b/g, '')

  // 2. Match explicit 'k' notation first (e.g., "250k", "₦180k", "250.5k")
  const kMatch = sanitized.match(/(?:₦|ngn|\b)\s*(\d{2,4}(?:\.\d+)?)\s*k\b/i)
  if (kMatch) {
    const val = Math.round(parseFloat(kMatch[1]) * 1000)
    return val >= 50000 ? val : null
  }

  // 3. Match full numbers >= 50,000 (e.g., "250,000", "250000")
  const fullMatch = sanitized.match(/(?:₦|ngn|\b)\s*(\d{2,3}(?:,\d{3})+|\d{5,7})\b/i)
  if (fullMatch) {
    const val = parseInt(fullMatch[1].replace(/,/g, ''), 10)
    return val >= 50000 ? val : null
  }

  return null
}

function detectCampusFilter(text: string): string | null {
  const lower = text.toLowerCase()
  if (
    lower.includes('uniport') ||
    lower.includes('choba') ||
    lower.includes('alakahia') ||
    lower.includes('delta park') ||
    lower.includes('ozuoba') ||
    lower.includes('aluu')
  ) {
    return 'uniport'
  }
  return null
}

function buildOpenRouterSystemPrompt(params: {
  studentName: string
  studentPhone: string
  teamLeaderName: string
  approvedAgents: Array<{ code: string; partner: PartnerApplication; areaLabels: string[] }>
  availableHouses: EnrichedWhatsAppListing[]
}): string {
  const agentsList = params.approvedAgents
    .map(
      ({ code, partner, areaLabels }) =>
        `- [${code}] ${partner.fullName} (${partner.agentKind === 'landlord' ? 'Direct Landlord — 0% Agency Fee' : 'Verified Campus Agent — 15% Agency Fee'}) | Org: ${partner.agencyName || 'Verified Partner'} | Coverage: ${areaLabels.join(', ')} | WhatsApp: ${partner.phoneNumber}`
    )
    .join('\n')

  const housesList = params.availableHouses
    .map((h) => {
      const c = h.costs
      return `- [${h.indexCode}] "${h.listing.title}" (${h.campusShort} - ${h.listing.landmark}) | Verified Partner: ${h.verifiedAgent?.fullName || h.listing.uploaderName} (${h.agentCode}, ${h.verifiedAgent?.phoneNumber || ''}) | Annual Rent: ₦${c.annualRent.toLocaleString()}/yr | Caution: ₦${c.cautionFee.toLocaleString()} | Legal: ₦${c.legalFee.toLocaleString()} | Utility: ₦${c.utilityFee.toLocaleString()} | Agency Fee: ₦${c.agencyFee.toLocaleString()} (${c.isDirectLandlord ? '0% Direct Landlord' : '15%'}) | TOTAL MOVE-IN COST: ₦${c.totalMoveInCost.toLocaleString()}`
    })
    .join('\n')

  const studentContextLine = params.studentName
    ? `You are chatting on WhatsApp with "${params.studentName}" (${params.studentPhone || 'WhatsApp Student'}).`
    : `You are chatting on WhatsApp with a student (${params.studentPhone || 'Guest Student'} — do not assume a name unless the student shares their name).`

  return `You are "Aroom Housing Assistant", a warm, friendly, conversational WhatsApp Student Housing & Trusted Agent Concierge for Nigerian university students.
${studentContextLine}
All agents and landlords in your roster have been manually vetted and approved by our Team Leader (${params.teamLeaderName}).

YOUR ROLE IN CONVERSATION:
1. Converse naturally like a helpful Nigerian campus housing friend (respond in natural English or Nigerian Pidgin if the student uses Pidgin). Never use technical or developer jargon.
2. Answer questions about houses, locations, walking distance to campus gates, water/power, agency fees vs direct landlord rooms, and how free inspections work.
3. Recommend ONLY Team-Leader-Verified Agents & Landlords from the live roster below by their actual name and WhatsApp phone number.
4. When discussing any house, give its transparent Move-In Cost Breakdown (Annual Rent, Caution, Legal, Utility, 15% Agent or ₦0 Direct Landlord fee, and *Total Move-In Cost*). Remind students that physical inspections are 100% FREE (₦0).
5. Ask natural follow-up questions to guide the student toward finding the right room or booking a free physical inspection with one of our verified agents.

LIVE TEAM-LEADER-VERIFIED AGENTS & LANDLORDS:
${agentsList}

LIVE AVAILABLE HOUSES & EXACT MOVE-IN COSTS:
${housesList}

BOOKING ACTION TAG RULE:
Whenever the student asks to book/schedule an inspection with an agent or for a house (e.g., "Book David tomorrow at 2pm", "Help me book #1 on Friday", "Yes book it for me"), include this exact machine tag on a new line at the VERY END of your response:
[[BOOK_INSPECTION: agent_code="A1" | house_code="#1" | slot="Tomorrow at 2:00 PM"]]`
}

/**
 * Main Conversational Handler for incoming Student WhatsApp messages.
 */
export async function processWhatsAppStudentMessage(input: {
  studentMessage: string
  studentPhone?: string
  studentName?: string
  history?: WhatsAppConversationTurn[]
}): Promise<WhatsAppBotReply> {
  const rawMsg = input.studentMessage.trim()
  const lower = rawMsg.toLowerCase()

  // Passively capture name or phone if the student mentions them in chat
  const passiveName = extractStudentNameFromText(rawMsg)
  if (passiveName) {
    saveStudentChatIdentity({ name: passiveName })
  }
  const passivePhone = extractNigerianPhone(rawMsg)
  if (passivePhone) {
    saveStudentChatIdentity({ phone: passivePhone })
  }

  const savedIdentity = getStudentChatIdentity()
  const studentPhone = (input.studentPhone || savedIdentity.phone || '').trim()
  const studentName = (input.studentName || savedIdentity.name || '').trim()
  const history = input.history || []
  const tl = getTeamLeaderProfile()
  const config = getTwilioAiConfig()

  const { approvedAgents, availableHouses } = await getVerifiedWhatsAppCatalog()

  const serializedAgents = approvedAgents.map(({ code, partner, areaLabels }) => ({
    code,
    id: partner.id,
    fullName: partner.fullName,
    agencyName: partner.agencyName || (partner.agentKind === 'landlord' ? 'Direct Property Owner' : 'Verified Campus Partner'),
    agentKind: partner.agentKind,
    phoneNumber: partner.phoneNumber,
    coverageAreas: areaLabels.join(', '),
  }))

  const serializedHouses = availableHouses.map((h) => ({
    code: h.indexCode,
    id: h.listing.id,
    title: h.listing.title,
    campus: h.campusShort,
    roomType: h.listing.roomType || 'self_contain',
    landmark: h.listing.landmark,
    annualRent: h.costs.annualRent,
    cautionFee: h.costs.cautionFee,
    legalFee: h.costs.legalFee,
    utilityFee: h.costs.utilityFee,
    agencyFee: h.costs.agencyFee,
    totalMoveIn: h.costs.totalMoveInCost,
    agentCode: h.agentCode,
    agentName: h.verifiedAgent?.fullName || h.listing.uploaderName,
    agentPhone: h.verifiedAgent?.phoneNumber || '+2348011112222',
    isDirectLandlord: h.costs.isDirectLandlord,
    imageUrl: h.listing.imageUrl,
  }))

  // ── PATH A: Call Supabase Edge Function `whatsapp-ai-webhook` ──
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-ai-webhook', {
        body: {
          from: studentPhone,
          studentName,
          body: rawMsg,
          history,
          approvedAgents: serializedAgents,
          availableHouses: serializedHouses,
          openRouterApiKey: config.aiApiKey || undefined,
          model: config.openRouterModel || 'openai/gpt-4o-mini',
        },
      })

      if (!error && data && typeof data.replyText === 'string' && data.replyText.trim()) {
        let localBooking: WhatsAppAgentBooking | undefined
        if (data.bookingCreated) {
          const b = data.bookingCreated
          const existing = listWhatsAppBookings()
          localBooking = {
            id: b.id || crypto.randomUUID(),
            bookingRef: b.bookingRef,
            referenceCode: b.bookingRef,
            studentPhone: b.studentPhone || studentPhone,
            studentName: b.studentName || studentName,
            agentProfileId: b.agentProfileId,
            agentId: b.agentProfileId,
            agentName: b.agentName,
            agentPhone: b.agentPhone,
            agentKind: b.agentKind || 'agent',
            agencyName: b.agencyName,
            listingId: b.listingId,
            houseId: b.listingId,
            listingTitle: b.listingTitle,
            houseTitle: b.listingTitle,
            landmark: b.landmark || '',
            meetupLandmark: b.meetupLandmark || b.landmark || 'UNIPORT Choba Gate',
            totalMoveInCost: b.totalMoveInCost || 0,
            preferredSlot: b.preferredSlot,
            status: b.status || 'pending_agent',
            createdAt: b.createdAt || new Date().toISOString(),
          }
          if (localBooking && !existing.some((x) => x.bookingRef === localBooking!.bookingRef)) {
            saveWhatsAppBookings([localBooking, ...existing])
          }
        }

        const mentionedHouseMatch = data.replyText.match(/#([1-6])\b/)
        const matchedMediaHouse = mentionedHouseMatch
          ? availableHouses[parseInt(mentionedHouseMatch[1], 10) - 1]
          : undefined

        return {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: data.replyText,
          mediaUrl: matchedMediaHouse?.listing.imageUrl,
          mediaCaption: matchedMediaHouse?.listing.title,
          twimlXml: data.twimlXml || buildTwimlXml(data.replyText, matchedMediaHouse?.listing.imageUrl),
          bookingCreated: localBooking,
          suggestedReplies: [
            'Which agent covers Choba?',
            'Show me the full cost for the Choba self-contain',
            'Book David for a free inspection tomorrow at 2pm',
            'Do you have direct landlord rooms?',
          ],
          timestamp: new Date().toISOString(),
        }
      }
    } catch {
      // Continue seamlessly to Path B / Path C
    }
  }

  // ── PATH B: Direct AI Call ──
  const activeOpenRouterKey = config.aiApiKey?.trim() || openRouterKeyFromEnv
  if (activeOpenRouterKey && activeOpenRouterKey.length > 10) {
    try {
      const systemPrompt = buildOpenRouterSystemPrompt({
        studentName,
        studentPhone,
        teamLeaderName: tl.fullName,
        approvedAgents,
        availableHouses,
      })

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeOpenRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Aroom WhatsApp Housing Assistant',
        },
        body: JSON.stringify({
          model: config.openRouterModel || 'openai/gpt-4o-mini',
          temperature: 0.5,
          max_tokens: 700,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8),
            { role: 'user', content: rawMsg },
          ],
        }),
      })

      if (resp.ok) {
        const json = await resp.json()
        let aiText: string = json?.choices?.[0]?.message?.content?.trim() || ''
        if (aiText) {
          let createdBooking: WhatsAppAgentBooking | undefined
          const bookingTagRegex =
            /\[\[BOOK_INSPECTION:\s*agent_code="([^"]*)"\s*\|\s*house_code="([^"]*)"\s*\|\s*slot="([^"]*)"\s*\]\]/i
          const tagMatch = aiText.match(bookingTagRegex)

          if (tagMatch) {
            const agentCode = tagMatch[1]
            const houseCode = tagMatch[2]
            const slot = tagMatch[3] || 'Tomorrow at 2:00 PM'
            const house =
              availableHouses.find((h) => h.indexCode.toLowerCase() === houseCode.toLowerCase()) ||
              availableHouses[0]
            const agentEntry =
              approvedAgents.find((a) => a.code.toLowerCase() === agentCode.toLowerCase()) ||
              approvedAgents[0]

            if (agentEntry) {
              createdBooking = await createWhatsAppAgentBooking({
                studentPhone,
                studentName,
                partner: agentEntry.partner,
                house,
                preferredSlot: slot,
              })
              aiText = aiText.replace(bookingTagRegex, '').trim()
              aiText += `\n\n✅ *Inspection Confirmed!* Reference: *#${createdBooking.bookingRef}* with *${agentEntry.partner.fullName}* (${agentEntry.partner.phoneNumber}) for *${slot}*.`
            }
          }

          const mentionedHouseMatch = aiText.match(/#([1-6])\b/)
          const matchedMediaHouse = mentionedHouseMatch
            ? availableHouses[parseInt(mentionedHouseMatch[1], 10) - 1]
            : undefined

          return {
            id: crypto.randomUUID(),
            sender: 'bot',
            text: aiText,
            mediaUrl: matchedMediaHouse?.listing.imageUrl,
            mediaCaption: matchedMediaHouse?.listing.title,
            twimlXml: buildTwimlXml(aiText, matchedMediaHouse?.listing.imageUrl),
            bookingCreated: createdBooking,
            suggestedReplies: [
              'Show me the full cost for the Choba self-contain',
              'Book David for tomorrow at 2pm',
              'Who are your verified agents?',
            ],
            timestamp: new Date().toISOString(),
          }
        }
      }
    } catch {
      // Fall through to natural conversational engine
    }
  }

  // ── PATH C: Natural 4-Stage Human Conversational Flow ──
  const firstName = getCleanFirstName(studentName)
  const nameComma = firstName ? `, ${firstName}` : ''
  const greetName = firstName ? ` ${firstName}` : ' there'

  // Stage 0: Anti-Extortion & Reported Issue Handler (Task 4.1)
  const isReportIntent =
    /\b(report|extort|asked for money|inspection fee|no show|agent didn't come|dem demand money|money for fuel|mobilization)\b/i.test(rawMsg)
  if (isReportIntent) {
    const currentBookings = listWhatsAppBookings()
    if (currentBookings.length > 0) {
      const updated = currentBookings.map((b, i) =>
        i === 0 ? { ...b, status: 'reported_issue' as const } : b
      )
      saveWhatsAppBookings(updated)
      const flagged = updated[0]

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aroom:agent-reported', {
            detail: { booking: flagged, reason: rawMsg },
          })
        )
      }

      const reportReply = [
        `🚨 *Report Logged with Team Leader!*`,
        ``,
        `Reference: *#${flagged.bookingRef}* with *${flagged.agentName}* has been flagged as *Reported Issue* for immediate investigation.`,
        `Our Team Leader (*${tl.fullName}*, ${tl.whatsappSupport}) has been alerted to review this partner's standing.`,
        ``,
        `🛡️ *Aroom Zero-Tolerance Policy:*`,
        `You must NEVER pay any mobilization, fuel, transport, or inspection fee to anyone on campus. Physical walkthroughs are 100% free.`,
        ``,
        `We will follow up with you directly on WhatsApp at *${flagged.studentPhone}*. Would you like to view other verified houses with a different accredited partner?`,
      ].join('\n')

      return {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: reportReply,
        twimlXml: buildTwimlXml(reportReply),
        suggestedReplies: [
          'Show me other available rooms',
          'Who are the verified agents I can book?',
        ],
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Stage 0b: Check if student is answering the Name + Phone Number Gate (Task 2.3)
  const detectedPhone = extractNigerianPhone(rawMsg)
  const draftRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('aroom_pending_booking_draft') : null
  if (detectedPhone && draftRaw) {
    try {
      saveStudentChatIdentity({
        phone: detectedPhone,
        ...(passiveName ? { name: passiveName } : {}),
      })
      localStorage.removeItem('aroom_pending_booking_draft')
      const draft = JSON.parse(draftRaw)
      const draftHouse = availableHouses[draft.houseIdx] || availableHouses[0]
      const draftAgentEntry =
        approvedAgents.find((a) => a.partner.id === draft.agentId) || approvedAgents[0]

      const resolvedName = passiveName || studentName || 'Campus Student'
      const resolvedFirst = getCleanFirstName(resolvedName)
      const resolvedComma = resolvedFirst ? `, ${resolvedFirst}` : ''

      const booking = await createWhatsAppAgentBooking({
        studentPhone: detectedPhone,
        studentName: resolvedName,
        partner: draftAgentEntry.partner,
        house: draftHouse,
        preferredSlot: draft.slot || 'Tomorrow at 2:00 PM',
        status: 'pending_agent',
      })

      const cleanWaDigits = draftAgentEntry.partner.phoneNumber.replace(/\D/g, '')
      const replyText = [
        `Thank you${resolvedComma}! Your WhatsApp number *${detectedPhone}* is saved. 🎉`,
        ``,
        `⏳ *Inspection Request #${booking.bookingRef} Logged*`,
        `🔖 Booking Reference: *#${booking.bookingRef}* (Awaiting Partner Confirm)`,
        `👤 *Verified Partner:* ${draftAgentEntry.partner.fullName} (${draftAgentEntry.partner.agentKind === 'landlord' ? 'Direct Landlord — 0% Fee' : 'Campus Agent'})`,
        draftAgentEntry.partner.agencyName ? `🏢 *Lodge / Agency:* ${draftAgentEntry.partner.agencyName}` : '',
        `📞 *Direct WhatsApp / Call:* https://wa.me/${cleanWaDigits} (${draftAgentEntry.partner.phoneNumber})`,
        `🏠 *Property:* ${booking.listingTitle}`,
        `📍 *Public Meetup Point:* ${booking.meetupLandmark}`,
        `🗓️ *Requested Time:* ${booking.preferredSlot}`,
        booking.totalMoveInCost > 0
          ? `💵 *Total Move-In Cost:* ₦${booking.totalMoveInCost.toLocaleString()} (All move-in fees included)`
          : `💵 *Move-In Pricing:* Verified with zero hidden fees`,
        ``,
        `We have pinged *${draftAgentEntry.partner.fullName}* to lock in this time. Click the WhatsApp link above to message them your pass *#${booking.bookingRef}*.`,
        ``,
        `🛡️ *Aroom Safety Rule:* Show pass *#${booking.bookingRef}* when meeting *${draftAgentEntry.partner.fullName}* at *${booking.meetupLandmark}*. NEVER pay any inspection, form, or transport fee. If asked for ₦1, reply *REPORT #${booking.bookingRef}* here immediately.`,
      ]
        .filter(Boolean)
        .join('\n')

      return {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: replyText,
        mediaUrl: draftHouse?.listing.imageUrl,
        mediaCaption: draftHouse?.listing.title,
        twimlXml: buildTwimlXml(replyText, draftHouse?.listing.imageUrl),
        bookingCreated: booking,
        suggestedReplies: [
          'Show me other available rooms',
          'Is the caution fee refundable?',
          'Who are your verified agents?',
        ],
        timestamp: new Date().toISOString(),
      }
    } catch {
      // Continue normal processing
    }
  }

  // Stage 1: Warm Human Greeting
  const isGreetingOnly =
    /^(hi|hello|hey|good morning|good afternoon|good evening|how far|wetin dey|yo|abeg|help)\b/i.test(rawMsg) &&
    rawMsg.split(/\s+/).length <= 6 &&
    !lower.includes('agent') &&
    !lower.includes('house') &&
    !lower.includes('room') &&
    !lower.includes('book')

  if (isGreetingOnly) {
    const replyText = [
      `Hi${greetName}! 👋 Welcome to *Aroom Housing*.`,
      ``,
      `I can help you check available student rooms, see the exact total move-in cost (with zero hidden charges), and book a free physical walkthrough with one of our *${approvedAgents.length} verified agents and landlords*.`,
      ``,
      `Just tell me what you're looking for in plain words! For example:`,
      `• _"I need a self-contain near Choba Gate under 300k"_`,
      `• _"Who are the verified agents I can book?"_`,
      `• _"Show me direct landlord houses with no agency fee"_`,
      ``,
      `Which campus are you schooling at, and what's your budget range? 😊`,
    ].join('\n')

    return {
      id: crypto.randomUUID(),
      sender: 'bot',
      text: replyText,
      twimlXml: buildTwimlXml(replyText),
      suggestedReplies: [
        'I school at UNIPORT, budget is around 300k',
        'Who are the verified agents I can book?',
        'Show me direct landlord houses with no agency fee',
      ],
      timestamp: new Date().toISOString(),
    }
  }

  // Stage 1b: Questions about Safety, Scam Protection, Inspection Fees
  if (
    lower.includes('scam') ||
    lower.includes('safe') ||
    lower.includes('inspection fee') ||
    lower.includes('pay before') ||
    lower.includes('how does it work') ||
    lower.includes('installment') ||
    lower.includes('refundable')
  ) {
    const replyText = [
      `Great question${nameComma}! 🛡️ Here is how we keep you 100% safe on Aroom:`,
      ``,
      `1️⃣ *Free Physical Inspections (₦0):* You NEVER pay any agent to inspect a room. Walking through the house in person is completely free.`,
      `2️⃣ *Personally Vetted Agents:* Every agent and landlord here (like *${approvedAgents[0]?.partner.fullName || 'David Opubo'}*) has had their ID card and phone number verified by our Team Leader (*${tl.fullName}*).`,
      `3️⃣ *Clear Upfront Costs:* Before you even step out, you see the exact *Annual Rent + Caution + Legal + Utility + Agency Fee (capped at 15%, or ₦0 for Direct Landlords)*. Caution fees are refundable when moving out if there's no property damage.`,
      ``,
      `Would you like to meet our verified agents or see the available houses and their full costs right now?`,
    ].join('\n')

    return {
      id: crypto.randomUUID(),
      sender: 'bot',
      text: replyText,
      twimlXml: buildTwimlXml(replyText),
      suggestedReplies: [
        'Show available houses and total costs',
        'Who are the verified agents I can book?',
        'Book David for a free inspection tomorrow at 2pm',
      ],
      timestamp: new Date().toISOString(),
    }
  }

  // Stage 4: Instant Free Inspection Booking ("book Femi", "book A1", "book #1", "book tomorrow", etc.)
  const isBookingIntent =
    lower.startsWith('book ') ||
    lower.includes('book agent') ||
    lower.includes('book inspection') ||
    lower.includes('schedule inspection') ||
    lower.includes('book david') ||
    lower.includes('book emeka') ||
    lower.includes('book a1') ||
    lower.includes('book a2') ||
    lower.includes('book #') ||
    (lower.includes('book') && (lower.includes('tomorrow') || lower.includes('friday') || lower.includes('today')))

  if (isBookingIntent) {
    const houseNumMatch = rawMsg.match(/#?([1-5])\b/)
    const agentCodeMatch = rawMsg.match(/\bA(\d)\b/i)

    let matchedHouse: EnrichedWhatsAppListing | undefined
    let matchedAgent: PartnerApplication | undefined

    if (houseNumMatch) {
      const idx = parseInt(houseNumMatch[1], 10) - 1
      matchedHouse = availableHouses[idx]
      if (matchedHouse?.verifiedAgent) {
        matchedAgent = matchedHouse.verifiedAgent
      }
    }

    if (!matchedAgent && agentCodeMatch) {
      const entry = approvedAgents.find(
        (a) => a.code.toLowerCase() === `a${agentCodeMatch[1]}`.toLowerCase()
      )
      matchedAgent = entry?.partner
      if (matchedAgent && !matchedHouse) {
        matchedHouse = availableHouses.find(
          (h) => h.verifiedAgent?.id === matchedAgent?.id
        )
      }
    }

    if (!matchedAgent) {
      const byName = approvedAgents.find(
        (a) =>
          lower.includes(a.partner.fullName.split(' ')[0].toLowerCase()) ||
          (a.partner.fullName.split(' ')[1] &&
            lower.includes(a.partner.fullName.split(' ')[1].toLowerCase()))
      )
      matchedAgent = byName?.partner || approvedAgents[0]?.partner
      if (matchedAgent && !matchedHouse) {
        matchedHouse = availableHouses.find(
          (h) => h.verifiedAgent?.id === matchedAgent?.id
        )
      }
    }

    if (!matchedAgent) {
      const noAgentBody = `All our verified agents are currently busy on campus walkthroughs. Please reach out to our Team Leader (${tl.fullName}) at ${tl.whatsappSupport} and we will arrange your inspection right away.`
      return {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: noAgentBody,
        twimlXml: buildTwimlXml(noAgentBody),
        suggestedReplies: ['Show available houses', 'Who are the verified agents?'],
        timestamp: new Date().toISOString(),
      }
    }

    const slotMatch = rawMsg.match(
      /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.,;]*/i
    )
    const preferredSlot = slotMatch ? slotMatch[0].trim() : 'Tomorrow at 2:00 PM'

    // Mandatory Student WhatsApp Phone + Name Gate (Task 2.3)
    const storedPhone = typeof localStorage !== 'undefined' ? localStorage.getItem('aroom_student_phone') || '' : ''
    const effectivePhone =
      isValidNigerianPhone(studentPhone)
        ? studentPhone
        : isValidNigerianPhone(storedPhone)
        ? storedPhone
        : ''

    if (!isValidNigerianPhone(effectivePhone)) {
      const houseIdx = matchedHouse ? availableHouses.indexOf(matchedHouse) : 0
      const draftPayload = {
        houseIdx,
        agentId: matchedAgent.id,
        slot: preferredSlot,
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aroom_pending_booking_draft', JSON.stringify(draftPayload))
      }

      const promptPhoneText = firstName
        ? `Almost done, ${firstName}! 👋 Drop your active *WhatsApp phone number* (e.g., 0803XXXXXXX) so we can generate your free *#ARM-XXXX* inspection pass and send it to your phone.`
        : `Almost done! 👋 Please reply with your *First Name and active WhatsApp number* (e.g., Chidi 08031234567) so we can generate your free *#ARM-XXXX* inspection pass and send it to your phone.`

      return {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: promptPhoneText,
        twimlXml: buildTwimlXml(promptPhoneText),
        suggestedReplies: firstName
          ? ['08031234567', '08123456789', 'Cancel booking']
          : ['Chidi 08031234567', 'Kemi 08123456789', 'Cancel booking'],
        timestamp: new Date().toISOString(),
      }
    }

    const booking = await createWhatsAppAgentBooking({
      studentPhone: effectivePhone,
      studentName: studentName || 'Campus Student',
      partner: matchedAgent,
      house: matchedHouse,
      preferredSlot,
      status: 'pending_agent',
    })

    const cleanWaDigits = matchedAgent.phoneNumber.replace(/\D/g, '')
    const replyText = [
      `⏳ *Inspection Request #${booking.bookingRef}* logged for *${booking.preferredSlot}* at *${booking.meetupLandmark}*. We have pinged *${matchedAgent.fullName}* to lock in this time. Click below to send your pass to *${matchedAgent.fullName}* on WhatsApp:`,
      `👉 https://wa.me/${cleanWaDigits}?text=Hello%20${encodeURIComponent(matchedAgent.fullName)}%2C%20my%20free%20inspection%20pass%20is%20%23${booking.bookingRef}%20for%20${encodeURIComponent(booking.listingTitle)}%20at%20${encodeURIComponent(booking.preferredSlot)}`,
      ``,
      `👤 *Verified ${matchedAgent.agentKind === 'landlord' ? 'Direct Landlord' : 'Agent'}:* ${matchedAgent.fullName}`,
      matchedAgent.agencyName ? `🏢 *Lodge / Agency:* ${matchedAgent.agencyName}` : '',
      `🏠 *Property:* ${booking.listingTitle}`,
      `📍 *Public Meetup Point:* ${booking.meetupLandmark}`,
      booking.totalMoveInCost > 0
        ? `💵 *Total Year-1 Move-In:* ₦${booking.totalMoveInCost.toLocaleString()} (All move-in fees included)`
        : `💵 *Move-In Pricing:* Verified with zero hidden fees`,
      ``,
      `🛡️ *Aroom Safety Rule:* Show pass *#${booking.bookingRef}* when meeting *${matchedAgent.fullName}* at *${booking.meetupLandmark}*. NEVER pay any inspection, form, or transport fee. If asked for ₦1, reply *REPORT #${booking.bookingRef}* here immediately.`,
    ]
      .filter(Boolean)
      .join('\n')

    return {
      id: crypto.randomUUID(),
      sender: 'bot',
      text: replyText,
      mediaUrl: matchedHouse?.listing.imageUrl,
      mediaCaption: matchedHouse?.listing.title,
      twimlXml: buildTwimlXml(replyText, matchedHouse?.listing.imageUrl),
      bookingCreated: booking,
      suggestedReplies: [
        'Show me other available rooms',
        'Is the caution fee refundable?',
        'Show direct landlord rooms with 0% agency fee',
      ],
      timestamp: new Date().toISOString(),
    }
  }

  // Stage 2b: Full Plain-English Cost Breakdown for a Specific House
  const singleHouseMatch =
    rawMsg.match(/^#?([1-5])$/) ||
    rawMsg.match(/(?:cost|breakdown|details|inspect|more about|house|room|for)\s*#?([1-5])\b/i)
  const isChobaCostRequest = lower.includes('choba') && lower.includes('cost')

  if ((singleHouseMatch || isChobaCostRequest) && !lower.includes('compare')) {
    const houseIdx = singleHouseMatch?.[1] ? parseInt(singleHouseMatch[1], 10) - 1 : 0
    const house = availableHouses[houseIdx] || availableHouses[0]
    if (house) {
      const c = house.costs
      const agent = house.verifiedAgent
      const agentFirstName = agent?.fullName.split(' ')[0] || 'David'
      const replyText = [
        `Sure thing${nameComma}! Here is the complete, transparent cost breakdown for *${house.listing.title}* (${house.campusShort}):`,
        ``,
        `📍 *Location:* ${house.listing.landmark}`,
        `👤 *Verified Partner:* ${agent ? `${agent.fullName} (${agent.phoneNumber})` : house.listing.uploaderName}`,
        ``,
        `💰 *Everything You Pay to Move In:*`,
        `• Annual Rent: *₦${c.annualRent.toLocaleString()}/yr*`,
        `• Caution Fee (Refundable): ₦${c.cautionFee.toLocaleString()}`,
        `• Legal & Agreement Fee: ₦${c.legalFee.toLocaleString()}`,
        `• Utility / Service Charge: ₦${c.utilityFee.toLocaleString()}`,
        `• Agency Fee: *${c.isDirectLandlord ? '₦0 (Direct Landlord — You save 15%!)' : `₦${c.agencyFee.toLocaleString()} (15%)`}*`,
        `• Physical Inspection: *₦0 (100% FREE)*`,
        `────────────────────`,
        `👉 *Total Move-In Cost: ₦${c.totalMoveInCost.toLocaleString()}*`,
        `💡 _From Year 2 onwards, you only pay the ₦${c.annualRent.toLocaleString()}/yr rent._`,
        ``,
        `Would you like me to book a free physical inspection with *${agent?.fullName || 'our verified partner'}* for tomorrow, or would you like to see other options?`,
      ].join('\n')

      return {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: replyText,
        mediaUrl: house.listing.imageUrl,
        mediaCaption: `${house.listing.title} — Total Move-In: ₦${c.totalMoveInCost.toLocaleString()}`,
        twimlXml: buildTwimlXml(replyText, house.listing.imageUrl),
        suggestedReplies: [
          `Book ${agentFirstName} for tomorrow at 2pm`,
          'Show me direct landlord houses with no agency fee',
          'Who are all your verified agents?',
        ],
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Stage 3: Personal Introduction to Verified Agents & Landlords
  const isAgentSearchIntent =
    lower.includes('agent') ||
    lower.includes('trusted') ||
    lower.includes('who can i book') ||
    lower.includes('verified partner') ||
    lower.includes('who are')

  if (isAgentSearchIntent && !lower.includes('no agency') && !lower.includes('0% agency') && !lower.includes('no agent fee')) {
    const campusFilter = detectCampusFilter(rawMsg)
    const filteredAgents = campusFilter
      ? approvedAgents.filter((a) =>
          a.partner.coverageAreas.some((c) => c.startsWith(campusFilter))
        )
      : approvedAgents

    const finalAgents = filteredAgents.length > 0 ? filteredAgents : approvedAgents

    const agentCards = finalAgents.map(({ partner, areaLabels }) => {
      const cleanWa = partner.phoneNumber.replace(/\D/g, '')
      return [
        `👤 *${partner.fullName}* — ✅ *Verified ${partner.agentKind === 'landlord' ? 'Direct Landlord' : 'Campus Agent'}*`,
        `🏷️ Fee Structure: ${partner.agentKind === 'landlord' ? '0% Agency Fee (Direct Owner)' : 'Standard 15% Agency Fee (Free Inspection)'}`,
        partner.agencyName ? `🏢 Lodge / Agency: ${partner.agencyName}` : '',
        `📍 Areas Covered: ${areaLabels.join(', ')}`,
        `📞 WhatsApp / Call: https://wa.me/${cleanWa} (${partner.phoneNumber})`,
      ]
        .filter(Boolean)
        .join('\n')
    })

    const firstAgentName = finalAgents[0]?.partner.fullName.split(' ')[0] || 'David'

    const replyText = [
      `Here are our *Verified Agents & Landlords*${campusFilter ? ` covering *${campusFilter.toUpperCase()}*` : ''} ready to take you on a free physical walkthrough${nameComma}:`,
      ``,
      ...agentCards.flatMap((c) => [c, '']),
      `Every partner above has been personally vetted by our Team Leader (*${tl.fullName}*). Just tell me who you'd like to book (for example, *"Book ${firstAgentName} tomorrow at 2pm"*), or ask to see the rooms they have available!`,
    ].join('\n')

    return {
      id: crypto.randomUUID(),
      sender: 'bot',
      text: replyText,
      twimlXml: buildTwimlXml(replyText),
      suggestedReplies: [
        `Book ${firstAgentName} tomorrow at 2pm`,
        'Show available houses and total costs',
        'Show direct landlord houses with 0% agency fee',
      ],
      timestamp: new Date().toISOString(),
    }
  }

  // Stage 2: Plain-English House & Total Cost Discovery with Survival Metrics & Budget Bucketing (Task 3.1 & 3.2)
  const campusFilter = detectCampusFilter(rawMsg)
  const maxBudget = parseMaxBudget(rawMsg)
  const directLandlordOnly =
    lower.includes('direct landlord') ||
    lower.includes('no agency') ||
    lower.includes('0% agency') ||
    lower.includes('no agent fee') ||
    lower.includes('landlord only')

  function renderListingBlock(h: EnrichedWhatsAppListing) {
    const c = h.costs
    const m = h.listing.survivalMetrics
    const agentName = h.verifiedAgent
      ? `${h.verifiedAgent.fullName} (✅ Verified ${h.verifiedAgent.agentKind === 'landlord' ? 'Landlord' : 'Agent'})`
      : h.listing.uploaderName
    const realityLine = m
      ? `📍 ${m.walkMinutesToGate} mins walk to ${m.nearestLandmark} • 💧 ${m.waterSource} • ⚡ ${m.powerStatus}`
      : `📍 ${h.listing.landmark}`

    return [
      `🏠 *${h.indexCode} ${h.listing.title}* (${h.campusShort})`,
      realityLine,
      `👤 Handled by: *${agentName}*`,
      `💰 Base Rent: ₦${c.annualRent.toLocaleString()}/yr | *Total Year-1 Move-In: ₦${c.totalMoveInCost.toLocaleString()}*`,
      `🛡️ Inspection Fee: *₦0 (FREE)*`,
    ].join('\n')
  }

  let replyText = ''
  let topHouse: EnrichedWhatsAppListing | undefined

  if (maxBudget !== null) {
    // Task 3.2: Disambiguation between Total Move-In vs Base Rent
    const underTotalBudget = availableHouses.filter((h) => {
      if (campusFilter && h.listing.campusId !== campusFilter) return false
      if (directLandlordOnly && !h.costs.isDirectLandlord) return false
      return h.costs.totalMoveInCost <= maxBudget
    })

    const baseRentFits = availableHouses.filter((h) => {
      if (campusFilter && h.listing.campusId !== campusFilter) return false
      if (directLandlordOnly && !h.costs.isDirectLandlord) return false
      return (
        h.costs.annualRent <= maxBudget &&
        h.costs.totalMoveInCost > maxBudget &&
        h.costs.totalMoveInCost <= maxBudget * 1.25
      )
    })

    topHouse = underTotalBudget[0] || baseRentFits[0] || availableHouses[0]
    const sections: string[] = []

    if (underTotalBudget.length > 0) {
      sections.push(
        `✅ *Total Move-In Under Your Budget (≤ ₦${maxBudget.toLocaleString()} All-In):*`,
        '',
        ...underTotalBudget.slice(0, 3).flatMap((h) => [renderListingBlock(h), ''])
      )
    }

    if (baseRentFits.length > 0) {
      sections.push(
        `💡 *Base Rent Fits, Total Move-In Slightly Above:*`,
        `_(Base rent fits your ₦${maxBudget.toLocaleString()} budget, and Year 2 drops back to base rent.)_`,
        '',
        ...baseRentFits.slice(0, 3).flatMap((h) => [renderListingBlock(h), ''])
      )
    }

    if (sections.length === 0) {
      sections.push(
        `Here are verified rooms closest to your ₦${maxBudget.toLocaleString()} budget around ${campusFilter ? campusFilter.toUpperCase() : 'UNIPORT'}${nameComma}:`,
        '',
        ...availableHouses.slice(0, 3).flatMap((h) => [renderListingBlock(h), ''])
      )
    }

    const topAgentFirstName = topHouse?.verifiedAgent?.fullName.split(' ')[0] || 'David'
    sections.push(
      `Which of these would you like to inspect? You can say *"Book ${topAgentFirstName} tomorrow at 2pm"* for a free walkthrough, or ask for details on *${topHouse?.indexCode || '#1'}*!`
    )

    replyText = sections.join('\n')
  } else {
    let matches = availableHouses.filter((h) => {
      if (campusFilter && h.listing.campusId !== campusFilter) return false
      if (directLandlordOnly && !h.costs.isDirectLandlord) return false
      return true
    })
    if (matches.length === 0) matches = availableHouses
    topHouse = matches[0]
    const topAgentFirstName = topHouse?.verifiedAgent?.fullName.split(' ')[0] || 'David'

    replyText = [
      `Here are verified campus rooms${campusFilter ? ` near *${campusFilter.toUpperCase()}*` : ''} ready for free physical walkthroughs${nameComma}:`,
      '',
      ...matches.slice(0, 4).flatMap((h) => [renderListingBlock(h), '']),
      `Which of these rooms would you like to inspect in person? You can ask me for the full fee breakdown of *${topHouse.indexCode}*, or say *"Book ${topAgentFirstName} tomorrow at 2pm"* to schedule your free walkthrough!`,
    ].join('\n')
  }

  const agentPromptName = topHouse?.verifiedAgent?.fullName.split(' ')[0] || 'David'

  return {
    id: crypto.randomUUID(),
    sender: 'bot',
    text: replyText,
    mediaUrl: topHouse?.listing.imageUrl,
    mediaCaption: topHouse
      ? `${topHouse.listing.title} — Total Move-In: ₦${topHouse.costs.totalMoveInCost.toLocaleString()}`
      : undefined,
    twimlXml: buildTwimlXml(replyText, topHouse?.listing.imageUrl),
    suggestedReplies: [
      `Show full cost breakdown for ${topHouse?.indexCode || '#1'}`,
      `Book ${agentPromptName} tomorrow at 2pm`,
      'Who are the verified agents I can book?',
      'How do I know this is safe?',
    ],
    timestamp: new Date().toISOString(),
  }
}

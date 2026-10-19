/**
 * Supabase Edge Function: whatsapp-ai-webhook
 * Conversational Twilio WhatsApp + OpenRouter AI Concierge for Aroom Campus Housing.
 *
 * Capabilities:
 *  - Natural multi-turn conversation (English & Nigerian Pidgin) powered by OpenRouter AI
 *  - Auto-detects your OpenRouter API key in Supabase Secrets (OPENROUTER_API_KEY, OPENROUTER_KEY, etc. or any sk-or-* key)
 *  - Grounded strictly in Team-Leader-Approved Agents & Landlords + Available Houses & Itemized Move-In Costs
 *  - Automatically detects when a student wants to book an agent/house during conversation and logs it in `public.whatsapp_bookings`
 *  - Zero external CDN dependencies (uses native fetch to Supabase PostgREST + OpenRouter API for instant cold-starts & zero IDE TS errors)
 *
 * Deploy via Supabase Dashboard -> Edge Functions -> whatsapp-ai-webhook (Turn OFF "Enforce JWT Verification")
 * Or CLI: npx supabase functions deploy whatsapp-ai-webhook --no-verify-jwt
 */

declare const Deno: {
  env: {
    get(key: string): string | undefined
    toObject(): Record<string, string>
  }
  serve(handler: (req: Request) => Promise<Response> | Response): void
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

// Lightweight native Supabase REST helpers (zero external module imports needed)
async function supabaseSelect<T = any>(table: string, queryParams: string): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${queryParams}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function supabaseInsert(table: string, payload: Record<string, unknown> | Array<Record<string, unknown>>): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`
    await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    // Ignore if optional table is not yet created
  }
}

// In-memory conversation cache as a fast fallback if `whatsapp_messages` table isn't created yet
const memoryConversations = new Map<string, ChatTurn[]>()

/**
 * Automatically locates the OpenRouter API key in Supabase Edge Function secrets,
 * regardless of whether the user named it OPENROUTER_API_KEY, OPENROUTER_KEY, OPENROUTER, AI_API_KEY, etc.
 */
function resolveOpenRouterApiKey(overrideKey?: string): string {
  if (overrideKey && overrideKey.trim().length > 10) {
    return overrideKey.trim()
  }

  const directCandidates = [
    Deno.env.get('OPENROUTER_API_KEY'),
    Deno.env.get('OPENROUTER_KEY'),
    Deno.env.get('OPENROUTER_AI_KEY'),
    Deno.env.get('OPENROUTER_AI'),
    Deno.env.get('OPENROUTER'),
    Deno.env.get('OPEN_ROUTER_API_KEY'),
    Deno.env.get('AI_API_KEY'),
    Deno.env.get('OPENAI_API_KEY'),
  ]

  for (const candidate of directCandidates) {
    if (candidate && candidate.trim().length > 10) {
      return candidate.trim()
    }
  }

  // Fallback scan: check any environment variable name containing 'openrouter' or value starting with 'sk-or-'
  try {
    const allEnv: Record<string, string> = Deno.env.toObject()
    for (const [key, val] of Object.entries(allEnv)) {
      if (
        typeof val === 'string' &&
        ((/open_?router/i.test(key) && val.trim().length > 10) || val.trim().startsWith('sk-or-'))
      ) {
        return val.trim()
      }
    }
  } catch {
    // ignore permission errors if any
  }

  return ''
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function twimlResponse(body: string, mediaUrl?: string): Response {
  const media = mediaUrl ? `<Media>${escapeXml(mediaUrl)}</Media>` : ''
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>${escapeXml(body)}</Body>${media}</Message></Response>`
  return new Response(xml, {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

const FALLBACK_AGENTS = [
  {
    code: 'A1',
    id: 'a1111111-1111-1111-1111-111111111111',
    fullName: 'Femi Ogundipe',
    agencyName: 'Akoka Campus Homes Ltd',
    agentKind: 'agent',
    phoneNumber: '+2348011112222',
    coverageAreas: 'UNILAG — Akoka, Abule Oja, Yaba / Onike',
  },
  {
    code: 'A2',
    id: 'a2222222-2222-2222-2222-222222222222',
    fullName: 'Chief Emeka Nwachukwu',
    agencyName: 'Nwachukwu Student Lodges (Direct Landlord)',
    agentKind: 'landlord',
    phoneNumber: '+2348033334444',
    coverageAreas: 'UNIPORT — Choba, Alakahia, Delta Park',
  },
]

const FALLBACK_HOUSES = [
  {
    code: '#1',
    id: '1',
    title: 'Spacious Self-Contain at Akoka',
    campus: 'UNILAG',
    roomType: 'Self-Contain',
    landmark: '5 mins walk from UNILAG Gate, Akoka',
    annualRent: 350000,
    cautionFee: 25000,
    legalFee: 15000,
    utilityFee: 10000,
    agencyFee: 52500,
    totalMoveIn: 452500,
    agentCode: 'A1',
    agentName: 'Femi Ogundipe',
    agentPhone: '+2348011112222',
    isDirectLandlord: false,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  },
  {
    code: '#2',
    id: '2',
    title: 'Modern Direct-Landlord Studio at Abule Oja',
    campus: 'UNILAG',
    roomType: 'Self-Contain',
    landmark: '3 mins from UNILAG Second Gate, Abule Oja',
    annualRent: 300000,
    cautionFee: 20000,
    legalFee: 10000,
    utilityFee: 10000,
    agencyFee: 0,
    totalMoveIn: 340000,
    agentCode: 'A2',
    agentName: 'Chief Emeka Nwachukwu',
    agentPhone: '+2348033334444',
    isDirectLandlord: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
  },
  {
    code: '#3',
    id: '3',
    title: 'Executive Tiled Self-Contain at Choba',
    campus: 'UNIPORT',
    roomType: 'Self-Contain',
    landmark: 'Opposite Choba Gate, UNIPORT',
    annualRent: 220000,
    cautionFee: 20000,
    legalFee: 10000,
    utilityFee: 10000,
    agencyFee: 0,
    totalMoveIn: 260000,
    agentCode: 'A2',
    agentName: 'Chief Emeka Nwachukwu',
    agentPhone: '+2348033334444',
    isDirectLandlord: true,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80',
  },
]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const urlObj = new URL(req.url)
    const contentType = (req.headers.get('content-type') || '').toLowerCase()
    const isJsonRequest = contentType.includes('application/json')

    // Health check only when GET has no Twilio message parameters
    if (req.method === 'GET' && !urlObj.searchParams.has('Body') && !urlObj.searchParams.has('From')) {
      const hasKey = Boolean(resolveOpenRouterApiKey())
      return new Response(
        JSON.stringify({
          status: 'active',
          service: 'Aroom Twilio WhatsApp + OpenRouter AI Concierge',
          openRouterConfigured: hasKey,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let from = '+2348055556666'
    let body = ''
    let profileName = 'Campus Student'
    let clientHistory: ChatTurn[] = []
    let clientAgents: typeof FALLBACK_AGENTS | null = null
    let clientHouses: typeof FALLBACK_HOUSES | null = null
    let overrideOpenRouterKey = ''
    let preferredModel = ''

    if (req.method === 'GET') {
      from = String(urlObj.searchParams.get('From') ?? '').replace('whatsapp:', '').trim() || '+2348055556666'
      body = String(urlObj.searchParams.get('Body') ?? '').trim()
      profileName = String(urlObj.searchParams.get('ProfileName') ?? 'Campus Student').trim()
    } else if (isJsonRequest) {
      const payload = await req.json()
      from = String(payload.from || payload.studentPhone || '+2348055556666').replace('whatsapp:', '').trim()
      body = String(payload.body || payload.studentMessage || '').trim()
      profileName = String(payload.profileName || payload.studentName || 'Campus Student')
      if (Array.isArray(payload.history)) {
        clientHistory = payload.history
      }
      if (Array.isArray(payload.approvedAgents) && payload.approvedAgents.length > 0) {
        clientAgents = payload.approvedAgents
      }
      if (Array.isArray(payload.availableHouses) && payload.availableHouses.length > 0) {
        clientHouses = payload.availableHouses
      }
      overrideOpenRouterKey = String(payload.openRouterApiKey || '')
      preferredModel = String(payload.model || '')
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      from = String(formData.get('From') ?? '').replace('whatsapp:', '').trim() || '+2348055556666'
      body = String(formData.get('Body') ?? '').trim()
      profileName = String(formData.get('ProfileName') ?? 'Campus Student').trim()
    } else {
      // Standard Twilio POST: application/x-www-form-urlencoded
      const rawText = await req.text()
      const params = new URLSearchParams(rawText)
      from = String(params.get('From') ?? '').replace('whatsapp:', '').trim() || '+2348055556666'
      body = String(params.get('Body') ?? '').trim()
      profileName = String(params.get('ProfileName') ?? 'Campus Student').trim()
    }

  // 1. Load Approved Agents from Supabase (strictly users.account_status = 'active')
  let agentsCatalog = FALLBACK_AGENTS
  if (clientAgents && clientAgents.length > 0) {
    agentsCatalog = clientAgents
  } else {
    const activeAgents = await supabaseSelect<any>(
      'agent_profiles',
      'select=id,full_name,agency_name,agent_kind,coverage_areas,users!inner(phone_number,email,account_status)&users.account_status=eq.active'
    )

    if (activeAgents.length > 0) {
      agentsCatalog = activeAgents.map((a: any, idx: number) => ({
        code: `A${idx + 1}`,
        id: String(a.id),
        fullName: String(a.full_name),
        agencyName: String(
          a.agency_name || (a.agent_kind === 'landlord' ? 'Direct Property Owner' : 'Verified Campus Partner')
        ),
        agentKind: String(a.agent_kind || 'agent'),
        phoneNumber: String(a.users?.phone_number || '+2348011112222'),
        coverageAreas:
          Array.isArray(a.coverage_areas) && a.coverage_areas.length > 0
            ? a.coverage_areas.join(', ')
            : 'UNILAG, UNIPORT, UNIBEN',
      }))
    }
  }

  // 2. Load Available Houses & Itemized Costs from Supabase
  let housesCatalog = FALLBACK_HOUSES
  if (clientHouses && clientHouses.length > 0) {
    housesCatalog = clientHouses
  } else {
    const dbListings = await supabaseSelect<any>(
      'listings',
      'select=id,title,room_type,price_annual_kobo,landmark_vicinity,agent_id,campuses(short_code)&availability_status=eq.available&limit=8'
    )

    if (dbListings.length > 0) {
      housesCatalog = dbListings.map((l: any, idx: number) => {
        const matchedAgent =
          agentsCatalog.find((a) => a.id === l.agent_id) ||
          agentsCatalog[idx % agentsCatalog.length] ||
          FALLBACK_AGENTS[0]
        const isDirectLandlord = matchedAgent.agentKind === 'landlord'
        const annualRent = Math.round(Number(l.price_annual_kobo || 35000000) / 100)
        const cautionFee = 25000
        const legalFee = 15000
        const utilityFee = 10000
        const agencyFee = isDirectLandlord ? 0 : Math.round(annualRent * 0.15)
        const totalMoveIn = annualRent + cautionFee + legalFee + utilityFee + agencyFee

        return {
          code: `#${idx + 1}`,
          id: String(l.id),
          title: String(l.title),
          campus: String(l.campuses?.short_code || 'UNILAG'),
          roomType: String(l.room_type || 'self_contain'),
          landmark: String(l.landmark_vicinity),
          annualRent,
          cautionFee,
          legalFee,
          utilityFee,
          agencyFee,
          totalMoveIn,
          agentCode: matchedAgent.code,
          agentName: matchedAgent.fullName,
          agentPhone: matchedAgent.phoneNumber,
          isDirectLandlord,
          imageUrl: FALLBACK_HOUSES[idx % FALLBACK_HOUSES.length].imageUrl,
        }
      })
    }
  }

  // 3. Retrieve Multi-Turn Conversation History for this student phone number
  let conversationHistory: ChatTurn[] = []
  if (clientHistory.length > 0) {
    conversationHistory = clientHistory.slice(-10)
  } else {
    const encodedPhone = encodeURIComponent(from)
    const storedMsgs = await supabaseSelect<any>(
      'whatsapp_messages',
      `select=role,content&student_phone=eq.${encodedPhone}&order=created_at.desc&limit=8`
    )

    if (storedMsgs.length > 0) {
      conversationHistory = storedMsgs
        .reverse()
        .map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content),
        }))
    } else {
      conversationHistory = memoryConversations.get(from) || []
    }
  }

  // 4. Build the Grounded System Prompt for OpenRouter AI
  const agentsContextText = agentsCatalog
    .map(
      (a) =>
        `- [${a.code}] ${a.fullName} (${a.agentKind === 'landlord' ? 'Direct Landlord — 0% Agency Fee' : 'Verified Agent — 15% Agency Fee'}) | Org: ${a.agencyName} | Coverage: ${a.coverageAreas} | WhatsApp: ${a.phoneNumber}`
    )
    .join('\n')

  const housesContextText = housesCatalog
    .map(
      (h) =>
        `- [${h.code}] "${h.title}" (${h.campus} - ${h.landmark}) | Handled by: ${h.agentName} (${h.agentCode}, ${h.agentPhone}) | Annual Rent: ₦${h.annualRent.toLocaleString()}/yr | Caution: ₦${h.cautionFee.toLocaleString()} | Legal: ₦${h.legalFee.toLocaleString()} | Utility: ₦${h.utilityFee.toLocaleString()} | Agency Fee: ₦${h.agencyFee.toLocaleString()} (${h.isDirectLandlord ? 'Direct Landlord 0%' : '15%'}) | TOTAL MOVE-IN COST: ₦${h.totalMoveIn.toLocaleString()}`
    )
    .join('\n')

  const systemPrompt = `You are "Aroom AI", a warm, smart, conversational WhatsApp Student Housing & Trusted Agent Concierge for Nigerian university students (UNILAG, UNIPORT, UNIBEN, DELSU, etc.).
You are chatting with a student named "${profileName}" (WhatsApp: ${from}).

YOUR CORE MISSION:
Help students naturally on WhatsApp without ever needing them to visit the website:
1. Converse naturally (in friendly Nigerian English or Nigerian Pidgin if the student uses Pidgin) — answer questions, compare options, and ask helpful follow-up questions.
2. Recommend ONLY Team-Leader-Verified Agents & Landlords from the live roster below. NEVER invent unverified agents.
3. Show available houses with their transparent, itemized Move-In Cost Breakdown (Annual Rent, Caution Fee, Legal Fee, Utility Fee, 15% Agent Fee or ₦0 Direct Landlord Fee, and Total Move-In Cost). Remind them that physical inspections are 100% FREE (₦0).
4. Help students book a Verified Agent for a FREE physical walkthrough directly in the chat.

LIVE TEAM-LEADER-VERIFIED AGENTS & LANDLORDS ROSTER:
${agentsContextText}

LIVE AVAILABLE HOUSES & EXACT MOVE-IN COSTS:
${housesContextText}

HOW TO FORMAT YOUR WHATSAPP REPLIES:
- Keep replies conversational, clear, and well-structured for WhatsApp mobile screens (use *bold* for key names/totals and bullet points for cost breakdowns).
- Always include the Agent's code (e.g., *A1*) and WhatsApp number when recommending an agent, and the House code (e.g., *#1*) when discussing a house.
- IMPORTANT BOOKING TRIGGER RULE:
  Whenever the student asks to book/schedule an inspection with an agent or for a house (e.g., "Book A1 tomorrow 2pm", "Abeg book Femi for me on Friday", "Yes book it for tomorrow morning"), OR confirms they want you to book an inspection:
  You MUST include this exact machine tag on a new line at the VERY END of your response:
  [[BOOK_INSPECTION: agent_code="A1" | house_code="#1" | slot="Tomorrow at 2:00 PM"]]
  (Replace A1, #1, and the slot with the chosen agent code, house code, and preferred time slot).`

  const openRouterKey = resolveOpenRouterApiKey(overrideOpenRouterKey)
  let aiReplyText = ''
  let usedOpenRouter = false
  let modelUsed = 'fallback-conversational-engine'

  if (openRouterKey) {
    const modelsToTry = preferredModel
      ? [preferredModel, 'openai/gpt-4o-mini', 'google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct:free']
      : ['openai/gpt-4o-mini', 'google/gemini-2.0-flash-001', 'anthropic/claude-3.5-haiku', 'meta-llama/llama-3.1-8b-instruct:free']

    for (const model of modelsToTry) {
      try {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aroom.ng',
            'X-Title': 'Aroom WhatsApp AI Housing Concierge',
          },
          body: JSON.stringify({
            model,
            temperature: 0.5,
            max_tokens: 700,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory,
              { role: 'user', content: body },
            ],
          }),
        })

        if (resp.ok) {
          const data = await resp.json()
          const content = data?.choices?.[0]?.message?.content?.trim()
          if (content) {
            aiReplyText = String(content)
            usedOpenRouter = true
            modelUsed = String(data?.model || model)
            break
          }
        }
      } catch {
        // Try next model in fallback chain
      }
    }
  }

  // 5. Check if AI triggered [[BOOK_INSPECTION: ...]] OR if student explicitly asked to book
  let bookingCreated: Record<string, unknown> | null = null
  const bookingTagRegex =
    /\[\[BOOK_INSPECTION:\s*agent_code="([^"]*)"\s*\|\s*house_code="([^"]*)"\s*\|\s*slot="([^"]*)"\s*\]\]/i
  const tagMatch = aiReplyText.match(bookingTagRegex)

  const lowerBody = body.toLowerCase()
  const explicitBookIntent =
    lowerBody.startsWith('book ') ||
    lowerBody.includes('book a1') ||
    lowerBody.includes('book a2') ||
    lowerBody.includes('book #1') ||
    lowerBody.includes('book #2') ||
    lowerBody.includes('book femi') ||
    lowerBody.includes('book emeka')

  if (tagMatch || explicitBookIntent) {
    const requestedAgentCode = tagMatch?.[1] || (body.match(/\b(A\d)\b/i)?.[1] ?? 'A1')
    const requestedHouseCode = tagMatch?.[2] || (body.match(/(#[1-9])/i)?.[1] ?? '#1')
    const requestedSlot =
      tagMatch?.[3] ||
      body.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.,;]*/i)?.[0] ||
      'Tomorrow at 2:00 PM'

    const chosenHouse =
      housesCatalog.find((h) => h.code.toLowerCase() === requestedHouseCode.toLowerCase()) || housesCatalog[0]
    const chosenAgent =
      agentsCatalog.find((a) => a.code.toLowerCase() === requestedAgentCode.toLowerCase()) ||
      agentsCatalog.find((a) => lowerBody.includes(a.fullName.split(' ')[0].toLowerCase())) ||
      agentsCatalog.find((a) => a.code === chosenHouse?.agentCode) ||
      agentsCatalog[0]

    const bookingRef = `ARM-${Math.floor(1000 + Math.random() * 9000)}`
    const bookingId = crypto.randomUUID()
    const listingTitle = chosenHouse?.title || `Campus Walkthrough with ${chosenAgent.fullName}`

    bookingCreated = {
      id: bookingId,
      bookingRef,
      studentPhone: from,
      studentName: profileName,
      agentProfileId: chosenAgent.id,
      agentName: chosenAgent.fullName,
      agentPhone: chosenAgent.phoneNumber,
      agentKind: chosenAgent.agentKind,
      agencyName: chosenAgent.agencyName,
      listingId: chosenHouse?.id,
      listingTitle,
      landmark: chosenHouse?.landmark || chosenAgent.coverageAreas,
      totalMoveInCost: chosenHouse?.totalMoveIn || 0,
      preferredSlot: requestedSlot,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }

    await supabaseInsert('whatsapp_bookings', {
      id: bookingId,
      booking_ref: bookingRef,
      student_phone: from,
      student_name: profileName,
      agent_profile_id: chosenAgent.id,
      listing_title: listingTitle,
      preferred_slot: requestedSlot,
      total_move_in_kobo: (chosenHouse?.totalMoveIn || 0) * 100,
      status: 'confirmed',
    })

    // Remove the raw tag from the student-facing message and append the official booking receipt
    aiReplyText = aiReplyText.replace(bookingTagRegex, '').trim()
    const cleanPhone = String(chosenAgent.phoneNumber).replace(/\D/g, '')
    const receiptBlock = [
      ``,
      `✅ *Official Inspection Booking Confirmed!*`,
      `🔖 *Booking Ref:* #${bookingRef}`,
      `👤 *Verified Partner:* ${chosenAgent.fullName} (${chosenAgent.code})`,
      `📞 *Direct WhatsApp:* https://wa.me/${cleanPhone} (${chosenAgent.phoneNumber})`,
      `🏠 *Property:* ${listingTitle}`,
      `🗓️ *Time Slot:* ${requestedSlot}`,
      `💵 *Inspection Fee:* ₦0 (100% FREE)`,
    ].join('\n')

    if (!aiReplyText.includes(bookingRef)) {
      aiReplyText = aiReplyText ? `${aiReplyText}\n${receiptBlock}` : receiptBlock.trim()
    }
  }

  // 6. Conversational Fallback if OpenRouter key was not yet set
  if (!aiReplyText) {
    if (lowerBody.includes('agent') || lowerBody.includes('trusted') || lowerBody.includes('who')) {
      const agentLines = agentsCatalog.map(
        (a) =>
          `*${a.code}. ${a.fullName}* — ✅ Team Leader Verified\n🏢 ${a.agencyName}\n📍 ${a.coverageAreas}\n📞 WhatsApp: ${a.phoneNumber}`
      )
      aiReplyText = [
        `Hey ${profileName.split(' ')[0]}! 👋 Here are our *Team-Leader-Verified Agents & Landlords* you can book right now on WhatsApp:`,
        ``,
        ...agentLines,
        ``,
        `Which of them would you like to book for a *FREE physical inspection*, or should I show you the houses they currently have available and their total move-in costs?`,
      ].join('\n\n')
    } else {
      const houseLines = housesCatalog.slice(0, 3).map(
        (h) =>
          `*${h.code}. ${h.title}* (${h.campus})\n📍 ${h.landmark}\n👤 Verified Partner: ${h.agentName} (${h.agentCode})\n💰 Rent: ₦${h.annualRent.toLocaleString()}/yr | Caution/Legal/Util: ₦${(h.cautionFee + h.legalFee + h.utilityFee).toLocaleString()} | Agency: ₦${h.agencyFee.toLocaleString()}\n👉 *Total Move-In Cost: ₦${h.totalMoveIn.toLocaleString()}*`
      )
      aiReplyText = [
        `Hi ${profileName.split(' ')[0]}! 😊 I can help you compare verified student houses, check the full move-in costs, and book a trusted agent right here on WhatsApp.`,
        ``,
        `Here are our top verified options right now:`,
        ...houseLines,
        ``,
        `Tell me your *campus*, your *budget*, or reply e.g. *"Book A1 tomorrow at 2pm"* and I'll set up your free inspection immediately!`,
      ].join('\n\n')
    }
  }

  // 7. Save Conversation Turn for Multi-Turn Memory
  const updatedHistory: ChatTurn[] = [
    ...conversationHistory.slice(-8),
    { role: 'user', content: body },
    { role: 'assistant', content: aiReplyText },
  ]
  memoryConversations.set(from, updatedHistory)

  await supabaseInsert('whatsapp_messages', [
    { student_phone: from, student_name: profileName, role: 'user', content: body },
    { student_phone: from, student_name: profileName, role: 'assistant', content: aiReplyText },
  ])

    // 8. Return JSON for Web Simulator OR TwiML XML for Twilio WhatsApp
    if (isJsonRequest) {
      return new Response(
        JSON.stringify({
          replyText: aiReplyText,
          usedOpenRouter,
          modelUsed,
          bookingCreated,
          twimlXml: `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>\n    <Body>${escapeXml(aiReplyText)}</Body>\n  </Message>\n</Response>`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return twimlResponse(aiReplyText)
  } catch (err) {
    const fallbackMsg =
      'Welcome to Aroom Housing! Reply with your campus (e.g. UNILAG, UNIPORT) and budget to see verified student rooms and book a trusted agent.'
    return twimlResponse(fallbackMsg)
  }
})

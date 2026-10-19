import { useEffect, useRef, useState } from 'react'
import {
  Send,
  ShieldCheck,
  Phone,
  CheckCheck,
  Sparkles,
  UserCheck,
  Building2,
  Calendar,
  MessageSquare,
  MapPin,
} from 'lucide-react'
import {
  processWhatsAppStudentMessage,
  getVerifiedWhatsAppCatalog,
  listWhatsAppBookings,
  WHATSAPP_BOOKING_EVENT,
  type WhatsAppBotReply,
  type EnrichedWhatsAppListing,
  type WhatsAppAgentBooking,
  type WhatsAppConversationTurn,
} from '@/lib/whatsappAiConcierge'
import {
  AUTH_CHANGE_EVENT,
  getCurrentSession,
  type PartnerApplication,
} from '@/lib/pilotAuthStore'

/** Format WhatsApp *bold* into clean React nodes */
function renderWhatsAppFormattedText(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*[^*]+\*)/g)
    return (
      <div key={i} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
        {parts.map((part, idx) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <strong key={idx} className="font-extrabold text-slate-900">
                {part.slice(1, -1)}
              </strong>
            )
          }
          return <span key={idx}>{part}</span>
        })}
      </div>
    )
  })
}

export function WhatsAppConciergePage() {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'agents' | 'bookings'>('chat')
  const [approvedAgents, setApprovedAgents] = useState<
    Array<{ code: string; partner: PartnerApplication; areaLabels: string[] }>
  >([])
  const [availableHouses, setAvailableHouses] = useState<EnrichedWhatsAppListing[]>([])
  const [bookings, setBookings] = useState<WhatsAppAgentBooking[]>(() => listWhatsAppBookings())
  const session = getCurrentSession()
  const studentFirstName = session?.fullName ? session.fullName.split(' ')[0] : 'there'

  const [messages, setMessages] = useState<WhatsAppBotReply[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: [
        `Hi ${studentFirstName}! 👋 Welcome to *Aroom Housing Assistant*.`,
        ``,
        `You can chat with me in English or Pidgin just like a friend on WhatsApp:`,
        `• *Tell me your school & budget* to see available rooms and the exact total amount you'll need to move in.`,
        `• *Connect with our verified agents* who have been personally vetted for your campus.`,
        `• *Book a 100% free physical inspection* so you can see the room yourself before paying a kobo.`,
        ``,
        `Which campus are you looking for a room around, and what's your yearly budget? 😊`,
      ].join('\n'),
      twimlXml: '',
      suggestedReplies: [
        'I need a self-contain near UNIPORT Choba Gate under ₦300k',
        'Who are your verified agents?',
        'Show me direct landlord rooms (₦0 agent fee)',
        'Book David for a free inspection tomorrow at 2pm',
      ],
      timestamp: new Date().toISOString(),
    },
  ])

  const loadCatalog = async () => {
    const cat = await getVerifiedWhatsAppCatalog()
    setApprovedAgents(cat.approvedAgents)
    setAvailableHouses(cat.availableHouses)
    setBookings(listWhatsAppBookings())
  }

  useEffect(() => {
    loadCatalog()
    window.addEventListener(AUTH_CHANGE_EVENT, loadCatalog)
    window.addEventListener(WHATSAPP_BOOKING_EVENT, loadCatalog)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, loadCatalog)
      window.removeEventListener(WHATSAPP_BOOKING_EVENT, loadCatalog)
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim()
    if (!clean || sending) return

    setMobilePanel('chat')

    const history: WhatsAppConversationTurn[] = messages.slice(-10).map((m) => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text,
    }))

    const studentMsg: WhatsAppBotReply = {
      id: crypto.randomUUID(),
      sender: 'student',
      text: clean,
      twimlXml: '',
      suggestedReplies: [],
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, studentMsg])
    setInput('')
    setSending(true)

    try {
      const botReply = await processWhatsAppStudentMessage({
        studentMessage: clean,
        studentName: session?.fullName || 'Amara Chukwuemeka',
        studentPhone: session?.phoneNumber || '+2348055556666',
        history,
      })
      setMessages((prev) => [...prev, botReply])
      setBookings(listWhatsAppBookings())
    } finally {
      setSending(false)
    }
  }

  const latestBotMessage = [...messages].reverse().find((m) => m.sender === 'bot')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Clean, Human-Friendly Header Bar */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-white truncate">
                Aroom WhatsApp Housing Assistant
              </h1>
              <p className="text-xs text-slate-400 truncate">
                {approvedAgents.length} Verified Campus Agents • {availableHouses.length} Available Rooms • Free Physical Inspections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>₦0 Inspection Fee Guarantee</span>
            </span>
          </div>
        </div>

        {/* ── Mobile Segmented Switcher (< lg) ── */}
        <div className="lg:hidden grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMobilePanel('chat')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
              mobilePanel === 'chat'
                ? 'bg-[#075e54] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel('agents')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
              mobilePanel === 'agents'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Agents ({approvedAgents.length})
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel('bookings')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
              mobilePanel === 'bookings'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Bookings ({bookings.length})
          </button>
        </div>

        {/* Main Layout: Left = WhatsApp Chat, Right = Verified Agents & Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT COLUMN: WHATSAPP CHAT (7 cols) ── */}
          <div
            className={`${
              mobilePanel === 'chat' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-7 bg-[#0b141a] rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex-col h-[calc(100vh-225px)] min-h-[480px] sm:h-[640px]`}
          >
            {/* WhatsApp Top Bar */}
            <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-extrabold text-white text-sm">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-extrabold">Aroom Housing Assistant</h2>
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300/30 font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/80">
                    Online • Replies instantly with verified rooms &amp; costs
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#0b141a]">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-sm ${
                        isBot
                          ? 'bg-white text-slate-800 rounded-tl-xs'
                          : 'bg-[#dcf8c6] text-slate-900 rounded-tr-xs'
                      }`}
                    >
                      {msg.mediaUrl && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-slate-200">
                          <img
                            src={msg.mediaUrl}
                            alt={msg.mediaCaption || 'Room photo'}
                            className="w-full h-36 object-cover"
                          />
                          {msg.mediaCaption && (
                            <div className="bg-slate-900 text-white px-2.5 py-1 text-[11px] font-bold truncate">
                              {msg.mediaCaption}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-0.5">{renderWhatsAppFormattedText(msg.text)}</div>

                      <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {!isBot && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
                      </div>
                    </div>
                  </div>
                )
              })}

              {sending && (
                <div className="flex items-start">
                  <div className="bg-white/90 text-slate-700 rounded-2xl px-3.5 py-2 text-xs font-semibold animate-pulse">
                    Typing a reply…
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggested Quick Replies Bar */}
            {latestBotMessage && latestBotMessage.suggestedReplies.length > 0 && (
              <div className="px-3 py-2 bg-[#111b21] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {latestBotMessage.suggestedReplies.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="p-2.5 bg-[#1f2c34] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rooms, total costs, or book a verified agent..."
                className="flex-1 bg-[#2a3942] text-white placeholder:text-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02906f] disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* ── RIGHT COLUMN: VERIFIED AGENTS & BOOKINGS (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            {/* Trusted Agents Bookable via WhatsApp */}
            <div
              className={`${
                mobilePanel === 'agents' ? 'block' : 'hidden lg:block'
              } rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3`}
            >
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Campus Agents &amp; Landlords ({approvedAgents.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Personally vetted by our Team Leader. Tap below to see their rooms or book a free inspection.
                </p>
              </div>

              <div className="space-y-2.5">
                {approvedAgents.map(({ partner, areaLabels }) => {
                  const firstName = partner.fullName.split(' ')[0]
                  return (
                    <div
                      key={partner.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {partner.fullName}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                            {partner.agentKind === 'landlord' ? (
                              <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                            <span className="truncate">
                              {partner.agencyName ||
                                (partner.agentKind === 'landlord'
                                  ? 'Direct Property Owner (0% Agent Fee)'
                                  : 'Verified Campus Agent')}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 shrink-0">
                          Verified
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{areaLabels.join(', ')}</span>
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            sendMessage(`What rooms does ${partner.fullName} have available and how much is the total cost?`)
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                        >
                          See {firstName}'s Rooms
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            sendMessage(`Book an inspection with ${partner.fullName} for tomorrow at 2pm`)
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold cursor-pointer"
                        >
                          Book Free Inspection
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Scheduled Inspections Log */}
            <div
              className={`${
                mobilePanel === 'bookings' ? 'block' : 'hidden lg:block'
              } rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Scheduled Free Inspections ({bookings.length})</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-emerald-400">Booking #{b.bookingRef}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 truncate">
                        {b.preferredSlot}
                      </span>
                    </div>
                    <p className="font-bold text-white truncate">{b.listingTitle}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="truncate">
                        With: <strong className="text-slate-200">{b.agentName}</strong>
                      </span>
                      <a
                        href={`https://wa.me/${b.agentPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline shrink-0"
                      >
                        <Phone className="w-3 h-3" /> Message on WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

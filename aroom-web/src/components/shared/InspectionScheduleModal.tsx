/**
 * InspectionScheduleModal.tsx
 * Comprehensive physical inspection scheduling modal for students:
 * 1. Immediate call option to the agent for on-the-spot physical inspection
 * 2. Scheduled physical inspection with clear "The earlier, the better" urgency prompt
 * 3. WhatsApp reminder automation (e.g. 45 & 15 minutes before inspection)
 * 4. Automatic "Property Taken" alert fallback with instant similar-budget alternatives
 */
import { useState } from 'react'
import {
  Calendar, Clock, MapPin, CheckCircle2,
  ShieldCheck, X, PhoneCall, MessageSquare,
  Flame, Bell, Zap
} from 'lucide-react'

export interface InspectionBooking {
  listingId: string
  listingTitle: string
  type: 'immediate_call' | 'scheduled'
  date?: string
  timeSlot?: string
  meetingPoint?: string
  companion?: string
  studentPhone: string
  whatsappReminder: boolean
}

interface InspectionScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  listing: {
    id: string
    title: string
    landmark: string
    price?: number
    campus?: string
    agentName?: string
    agentPhone?: string
  }
  onConfirm: (booking: InspectionBooking) => void
}

const AVAILABLE_DAYS = [
  { label: 'Today (Fastest)', date: 'Wed, Oct 14', sub: 'High demand — best chance' },
  { label: 'Tomorrow', date: 'Thu, Oct 15', sub: 'Rooms move quickly' },
  { label: 'In 2 days', date: 'Fri, Oct 16', sub: 'Subject to availability' },
  { label: 'Weekend', date: 'Sat, Oct 17', sub: 'Peak student inspection day' },
]

const TIME_SLOTS = [
  { time: '10:00 AM', label: 'Morning slot (Best daylight view)' },
  { time: '1:30 PM', label: 'Midday / Lecture break' },
  { time: '4:00 PM', label: 'Late afternoon' },
  { time: '5:30 PM', label: 'Evening slot before dusk' },
]

const MEETING_POINTS = [
  { id: 'gate', label: 'Campus Main Gate / Park', desc: 'Agent meets you at school gate and escorts you' },
  { id: 'lodge', label: 'Directly in front of Lodge', desc: 'Meet in front of compound entrance' },
  { id: 'landmark', label: 'Nearby Junction / ATM', desc: 'Safe busy meeting point close by' },
]

export function InspectionScheduleModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
}: InspectionScheduleModalProps) {
  // Mode: 'call_now' (immediate) vs 'schedule' (convenient time)
  const [inspectionMode, setInspectionMode] = useState<'schedule' | 'call_now'>('schedule')
  const [selectedDay, setSelectedDay] = useState(AVAILABLE_DAYS[0].date)
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].time)
  const [meetingPoint, setMeetingPoint] = useState(MEETING_POINTS[0].label)
  const [companion] = useState('Coming with a classmate/friend')
  const [studentPhone, setStudentPhone] = useState('08023456789')
  const [whatsappReminder, setWhatsappReminder] = useState(true)
  const [callInitiated, setCallInitiated] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (!isOpen) return null

  const agentPhone = listing.agentPhone || '08034567890'
  const agentName = listing.agentName || 'Agent Femi'

  const handleImmediateCall = () => {
    setCallInitiated(true)
    setTimeout(() => {
      onConfirm({
        listingId: listing.id,
        listingTitle: listing.title,
        type: 'immediate_call',
        studentPhone,
        whatsappReminder: true,
      })
      setCallInitiated(false)
      onClose()
      // Trigger native tel: URI for mobile or desktop handler
      window.open(`tel:${agentPhone}`, '_self')
    }, 1000)
  }

  const handleScheduledBook = () => {
    setConfirmed(true)
    setTimeout(() => {
      onConfirm({
        listingId: listing.id,
        listingTitle: listing.title,
        type: 'scheduled',
        date: selectedDay,
        timeSlot: selectedTime,
        meetingPoint,
        companion,
        studentPhone,
        whatsappReminder,
      })
      setConfirmed(false)
      onClose()
    }, 1100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-emerald-700 via-green-700 to-emerald-800 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Free Physical Inspection Guaranteed
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">Physical Room Walkthrough</h3>
            <p className="text-xs text-emerald-100 truncate max-w-xs sm:max-w-sm mt-0.5">
              {listing.title} ({listing.landmark})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Urgency Announcement Banner */}
        <div className="px-6 py-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2 text-xs text-amber-950 font-medium">
          <Flame className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>The earlier, the better:</strong> Good campus accommodations get paid for within 24–48 hours. Choose immediate inspection if you are nearby!
          </span>
        </div>

        {/* Tab switch: Call Now vs Schedule */}
        <div className="px-6 pt-4 pb-1">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setInspectionMode('schedule')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                inspectionMode === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Schedule Inspection</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectionMode('call_now')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                inspectionMode === 'call_now'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Agent Now (Immediate)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">

          {/* ── MODE 1: CALL AGENT NOW FOR IMMEDIATE INSPECTION ── */}
          {inspectionMode === 'call_now' ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Direct Call to {agentName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Are you currently near <strong>{listing.landmark}</strong>? Call the verified agent right now to check if the keys are ready for an immediate walkthrough.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-sm font-extrabold text-slate-800">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>{agentPhone}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Phone Number (for WhatsApp follow-up &amp; location drop)
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. 08012345678"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Aroom logs this call so the agent cannot demand any inspection fee from you.
                </p>
              </div>

              <button
                type="button"
                onClick={handleImmediateCall}
                disabled={callInitiated}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-sm"
              >
                {callInitiated ? (
                  <>
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    <span>Connecting to Agent…</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Agent Now for Immediate Inspection</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* 1. Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    1. Inspection Date (Earlier is Better)
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Rooms move fast
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_DAYS.map((d) => {
                    const isSelected = selectedDay === d.date
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDay(d.date)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                        }`}
                      >
                        <span className="text-xs font-bold text-emerald-800">{d.label}</span>
                        <span className="text-[11px] text-slate-600">{d.date}</span>
                        <span className="text-[10px] text-slate-400 leading-tight">{d.sub}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Time Slot */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  2. Select Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const isSelected = selectedTime === t.time
                    return (
                      <button
                        key={t.time}
                        type="button"
                        onClick={() => setSelectedTime(t.time)}
                        className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" /> {t.time}
                          </div>
                          <div className="text-[10px] text-slate-400">{t.label}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Meeting Point */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  3. Safe Meeting Location
                </label>
                <div className="space-y-1.5">
                  {MEETING_POINTS.map((m) => {
                    const isSelected = meetingPoint === m.label
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMeetingPoint(m.label)}
                        className={`w-full p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{m.label}</p>
                            <p className="text-[10px] text-slate-400">{m.desc}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 4. WhatsApp Reminder Checkbox */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={whatsappReminder}
                    onChange={(e) => setWhatsappReminder(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Send WhatsApp reminders before inspection time
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      You'll receive a direct WhatsApp ping <strong>45 minutes</strong> and <strong>15 minutes</strong> before inspection with directions and agent live contact.
                    </p>
                  </div>
                </label>

                {whatsappReminder && (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      WhatsApp Phone Number
                    </label>
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      placeholder="e.g. 08023456789"
                    />
                  </div>
                )}
              </div>

              {/* Automatic "Property Taken" Fallback Guarantee */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <Bell className="w-3.5 h-3.5 text-amber-600" /> Instant "Room Taken" Notification Guarantee
                </div>
                <p>
                  If this room gets rented out before your inspection slot, Aroom's bot will <strong>automatically WhatsApp notify you immediately</strong> so you don't waste transport, and instantly suggest <strong>alternative verified rooms</strong> within your exact budget and location!
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer for Scheduled Mode */}
        {inspectionMode === 'schedule' && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleScheduledBook}
              disabled={confirmed}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {confirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling with WhatsApp Alerts…</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Lock Inspection Time</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

/**
 * InspectionScheduleModal.tsx (Viewing Request Flow)
 * Student viewing-request modal:
 * - Direct phone viewing request to assigned partner
 * - Scheduled on-site viewing with date & daytime slot selection
 * - Safe meeting point selection (Campus Gate, Lodge Entrance, Nearby Junction)
 * - Zero fee language per Engineering Brief Workstream B
 */
import { useState } from 'react'
import {
  Calendar, CheckCircle2,
  ShieldCheck, X, PhoneCall,
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
    uploaderType?: 'agent' | 'landlord'
  }
  onConfirm: (booking: InspectionBooking) => void
}

const AVAILABLE_DAYS = [
  { label: 'Today', date: 'Wed, Oct 14', sub: 'High demand' },
  { label: 'Tomorrow', date: 'Thu, Oct 15', sub: 'Recommended slot' },
  { label: 'In 2 days', date: 'Fri, Oct 16', sub: 'Subject to schedule' },
  { label: 'Weekend', date: 'Sat, Oct 17', sub: 'Popular viewing day' },
]

const TIME_SLOTS = [
  { time: '10:00 AM', label: 'Morning slot (Best daylight view)' },
  { time: '1:30 PM', label: 'Midday / Lecture break' },
  { time: '4:00 PM', label: 'Late afternoon' },
  { time: '5:30 PM', label: 'Evening slot before dusk' },
]

const MEETING_POINTS = [
  { id: 'gate', label: 'Campus Main Gate / Park', desc: 'Partner meets you at school gate and escorts you' },
  { id: 'lodge', label: 'Directly in front of Lodge', desc: 'Meet in front of compound entrance' },
  { id: 'landmark', label: 'Nearby Junction / ATM', desc: 'Safe busy meeting point close by' },
]

export function InspectionScheduleModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
}: InspectionScheduleModalProps) {
  const [viewingMode, setViewingMode] = useState<'schedule' | 'call_now'>('schedule')
  const [selectedDay, setSelectedDay] = useState(AVAILABLE_DAYS[0].date)
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].time)
  const [meetingPoint, setMeetingPoint] = useState(MEETING_POINTS[0].label)
  const [studentPhone, setStudentPhone] = useState('08023456789')
  const [whatsappReminder, setWhatsappReminder] = useState(true)
  const [callInitiated, setCallInitiated] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (!isOpen) return null

  const partnerPhone = listing.agentPhone || '08034567890'
  const partnerName = listing.agentName || (listing.uploaderType === 'landlord' ? 'Chief Emeka Nwosu (Landlord)' : 'David Opubo (Agent)')

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
      window.open(`tel:${partnerPhone}`, '_self')
    }, 800)
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmed(true)
    setTimeout(() => {
      onConfirm({
        listingId: listing.id,
        listingTitle: listing.title,
        type: 'scheduled',
        date: selectedDay,
        timeSlot: selectedTime,
        meetingPoint,
        studentPhone,
        whatsappReminder,
      })
      setConfirmed(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-extrabold text-base leading-tight">Request a Viewing</h2>
              <p className="text-xs text-slate-300 truncate max-w-xs">{listing.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {/* Assigned Partner card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Partner
              </span>
              <div className="font-bold text-sm text-slate-800">{partnerName}</div>
              <div className="text-xs text-slate-500">{listing.landmark}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accredited</span>
            </span>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewingMode('schedule')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                viewingMode === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Schedule Viewing
            </button>
            <button
              type="button"
              onClick={() => setViewingMode('call_now')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                viewingMode === 'call_now'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📞 Call Partner Now
            </button>
          </div>

          {viewingMode === 'call_now' ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <PhoneCall className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Connect Directly with {partnerName.split(' ')[0]}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Ready to see this room immediately? Call the accredited partner to coordinate an on-the-spot physical viewing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleImmediateCall}
                disabled={callInitiated}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{callInitiated ? 'Connecting call…' : `Call Partner (${partnerPhone})`}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {/* Day selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Choose Preferred Day
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_DAYS.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDay(d.date)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        selectedDay === d.date
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-800">{d.label}</div>
                      <div className="text-[11px] text-slate-500">{d.date}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Choose Daytime Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t.time}
                      type="button"
                      onClick={() => setSelectedTime(t.time)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        selectedTime === t.time
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-800">{t.time}</div>
                      <div className="text-[10px] text-slate-500 truncate">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meeting Point */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Safe Campus Meeting Point
                </label>
                <select
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
                >
                  {MEETING_POINTS.map((m) => (
                    <option key={m.id} value={m.label}>
                      {m.label} — {m.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Your Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="080 1234 5678"
                  required
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>

              {/* WhatsApp reminder checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={whatsappReminder}
                  onChange={(e) => setWhatsappReminder(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Send me a WhatsApp reminder 45 mins before the viewing</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={confirmed}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {confirmed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Viewing Request Sent!</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Viewing Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

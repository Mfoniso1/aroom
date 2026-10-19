import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  BadgeCheck,
  MapPin,
  Camera,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  updateCurrentUserProfile,
  fileToDataUrl,
  type ActiveSession,
} from '@/lib/pilotAuthStore'
import { CAMPUSES } from '@/lib/campuses'
import { AGENT_LOCATIONS } from '@/lib/agentLocations'

interface EditProfileModalProps {
  session: ActiveSession
  isOpen: boolean
  onClose: () => void
  onSaved?: (updated: ActiveSession) => void
}

export function EditProfileModal({
  session,
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(session.fullName)
  const [phoneNumber, setPhoneNumber] = useState(session.phoneNumber)
  const [campus, setCampus] = useState(session.campus || 'uniport')
  const [matricNumber, setMatricNumber] = useState(session.matricNumber || '')
  const [agencyName, setAgencyName] = useState(session.agencyName || '')
  const [bio, setBio] = useState(session.bio || '')
  const [coverageAreas, setCoverageAreas] = useState<string[]>(
    session.coverageAreas || ['choba']
  )
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session.avatarUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)

  if (!isOpen) return null

  const isStudent = session.role === 'student'
  const isLandlord = session.agentKind === 'landlord' || session.role === 'landlord'

  const handleAvatarFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch {
      setError('Could not load image preview.')
    }
  }

  const toggleCoverage = (id: string) => {
    setCoverageAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateCurrentUserProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        campus: isStudent ? campus : undefined,
        matricNumber: isStudent ? matricNumber : undefined,
        avatarUrl,
        agencyName: !isStudent ? agencyName : undefined,
        coverageAreas: !isStudent ? coverageAreas : undefined,
        bio: !isStudent ? bio : undefined,
      })
      setSavedNotice(true)
      onSaved?.(updated)
      setTimeout(() => {
        setSavedNotice(false)
        onClose()
      }, 650)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Edit Your Profile</h2>
            <p className="text-xs text-slate-400">
              Changes are saved immediately to your Aroom profile
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated!</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-4 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer shadow-xs"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Change Profile Photo
              </button>
              <p className="text-xs text-slate-400 mt-0.5">
                {session.email} (Email is locked to your account)
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={session.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Student-Specific Fields */}
          {isStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / Campus
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortCode} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Matric / Student ID
                </label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Partner (Agent / Landlord) Fields */}
          {!isStudent && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isLandlord ? 'Property / Lodge Name' : 'Agency / Business Name'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder={
                      isLandlord ? 'e.g. Eze Royal Student Lodge' : 'e.g. Choba Campus Homes'
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Bio / Verification Summary
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your properties or campus housing experience..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Coverage Areas</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  {AGENT_LOCATIONS.map((loc) => {
                    const selected = coverageAreas.includes(loc.id)
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => toggleCoverage(loc.id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {loc.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

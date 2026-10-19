import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Phone,
  Mail,
  Building2,
  UserCheck,
  AlertCircle,
  Ban,
  RotateCcw,
  RefreshCw,
  LogOut,
  Eye,
  LayoutGrid,
  Users,
  UserCog,
  ClipboardCheck,
  Search,
  GraduationCap,
  MapPin,
  ExternalLink,
  Check,
} from 'lucide-react'
import {
  listPartnerApplications,
  listStudentAccounts,
  updatePartnerApproval,
  togglePartnerPhoneContacted,
  createPreApprovedPartner,
  getTeamLeaderNotifications,
  markAllTeamLeaderNotificationsRead,
  getTeamLeaderProfile,
  updateTeamLeaderProfile,
  getCurrentSession,
  logoutPilotUser,
  AUTH_CHANGE_EVENT,
  type PartnerApplication,
  type ApprovalStatus,
  type PartnerKind,
  type StudentAccount,
  type TeamLeaderProfile,
} from '@/lib/pilotAuthStore'
import { AGENT_LOCATIONS } from '@/lib/agentLocations'
import { CAMPUSES } from '@/lib/campuses'
import { useListings, approveListingVerification } from '@/lib/listingsStore'
import {
  listWhatsAppBookings,
  WHATSAPP_BOOKING_EVENT,
  type WhatsAppAgentBooking,
} from '@/lib/whatsappAiConcierge'

type CommandTab = 'overview' | 'queue' | 'roster' | 'whatsapp' | 'profile'

export function TeamLeaderApprovalsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CommandTab>('overview')
  const [session, setSession] = useState(() => getCurrentSession())
  const [tlProfile, setTlProfile] = useState<TeamLeaderProfile>(() => getTeamLeaderProfile())
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('pending')
  const [counts, setCounts] = useState<Record<ApprovalStatus, number>>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  })
  const [allApps, setAllApps] = useState<PartnerApplication[]>([])
  const [items, setItems] = useState<PartnerApplication[]>([])
  const [students, setStudents] = useState<StudentAccount[]>([])
  const [waBookings, setWaBookings] = useState<WhatsAppAgentBooking[]>(() => listWhatsAppBookings())
  const [rosterSearch, setRosterSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionBusyId, setActionBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Notification drawer
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifData, setNotifData] = useState(() => getTeamLeaderNotifications())

  // Reject / Suspend modal
  const [rejectTarget, setRejectTarget] = useState<{
    app: PartnerApplication
    mode: 'reject' | 'suspend'
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // ID Card preview modal
  const [previewIdApp, setPreviewIdApp] = useState<PartnerApplication | null>(null)

  // Pre-approved Partner Registration modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPartner, setNewPartner] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: 'Agent@12345',
    agentKind: 'agent' as PartnerKind,
    agencyName: '',
    coverageAreas: ['choba'] as string[],
  })

  // Team Leader profile form
  const [profileForm, setProfileForm] = useState<TeamLeaderProfile>(() => getTeamLeaderProfile())

  const refreshData = async (currentFilter = filter) => {
    setLoading(true)
    const [allRes, filteredRes] = await Promise.all([
      listPartnerApplications('all'),
      listPartnerApplications(currentFilter),
    ])
    setCounts(filteredRes.counts)
    setAllApps(allRes.items)
    setItems(filteredRes.items)
    setStudents(listStudentAccounts())
    setWaBookings(listWhatsAppBookings())
    setNotifData(getTeamLeaderNotifications())
    setSession(getCurrentSession())
    setTlProfile(getTeamLeaderProfile())
    setLoading(false)
  }

  useEffect(() => {
    refreshData(filter)
    const onAuthChange = () => refreshData(filter)
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange)
    window.addEventListener(WHATSAPP_BOOKING_EVENT, onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange)
      window.removeEventListener(WHATSAPP_BOOKING_EVENT, onAuthChange)
      window.removeEventListener('storage', onAuthChange)
    }
  }, [filter])

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleApprove = async (app: PartnerApplication) => {
    setActionBusyId(app.id)
    try {
      await updatePartnerApproval(app.id, 'approve', { phoneContacted: true })
      showToast(
        'success',
        `${app.fullName} (${app.agentKind}) is now APPROVED and can publish properties.`
      )
      await refreshData(filter)
    } catch (err: any) {
      showToast('error', err.message || 'Could not approve applicant')
    } finally {
      setActionBusyId(null)
    }
  }

  const handleConfirmRejectOrSuspend = async () => {
    if (!rejectTarget) return
    const { app, mode } = rejectTarget
    setActionBusyId(app.id)
    try {
      await updatePartnerApproval(app.id, mode, {
        reason:
          rejectReason.trim() ||
          (mode === 'reject'
            ? 'ID card or phone verification could not be confirmed by Team Leader.'
            : 'Account suspended by Team Leader.'),
      })
      showToast(
        'success',
        `${app.fullName}'s account has been ${mode === 'reject' ? 'rejected' : 'suspended'}.`
      )
      setRejectTarget(null)
      setRejectReason('')
      await refreshData(filter)
    } catch (err: any) {
      showToast('error', err.message || 'Action failed')
    } finally {
      setActionBusyId(null)
    }
  }

  const handleReinstate = async (app: PartnerApplication) => {
    setActionBusyId(app.id)
    try {
      await updatePartnerApproval(app.id, 'reinstate')
      showToast('success', `${app.fullName} has been reinstated and approved.`)
      await refreshData(filter)
    } catch (err: any) {
      showToast('error', err.message || 'Could not reinstate account')
    } finally {
      setActionBusyId(null)
    }
  }

  const handleToggleContacted = async (app: PartnerApplication) => {
    const next = !app.phoneContacted
    await togglePartnerPhoneContacted(app.id, next)
    await refreshData(filter)
  }

  const handleCreatePreApproved = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartner.fullName.trim() || !newPartner.email.trim() || !newPartner.phoneNumber.trim()) {
      showToast('error', 'Please fill in Full Name, Email, and Phone Number.')
      return
    }
    try {
      const created = await createPreApprovedPartner(newPartner)
      showToast(
        'success',
        `Registered & pre-approved ${created.fullName} (${created.agentKind}). They can log in immediately!`
      )
      setShowAddModal(false)
      setNewPartner({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: 'Agent@12345',
        agentKind: 'agent',
        agencyName: '',
        coverageAreas: ['choba'],
      })
      setFilter('approved')
      await refreshData('approved')
    } catch (err: any) {
      showToast('error', err.message || 'Could not create partner')
    }
  }

  const handleSaveTeamLeaderProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = updateTeamLeaderProfile(profileForm)
    setTlProfile(updated)
    showToast('success', 'Team Leader profile & contact settings updated!')
  }

  const locationLabel = (id: string) => AGENT_LOCATIONS.find((l) => l.id === id)?.label || id

  const { listings: allListings } = useListings()
  const pendingLodges = allListings.filter(
    (l) => l.verificationStatus === 'unverified_new' && l.verificationRequested
  )

  const approvedPartners = allApps.filter((a) => a.status === 'approved')
  const filteredRoster = approvedPartners.filter(
    (p) =>
      p.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      p.phoneNumber.includes(rosterSearch) ||
      (p.agencyName || '').toLowerCase().includes(rosterSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row">
      {/* ── LEFT COMMAND SIDEBAR (Unique Team Leader Executive UI) ── */}
      <aside className="w-full lg:w-72 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">AROOM</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Command
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Team Leader Verification Hub</p>
              </div>
            </div>

            {/* Mobile Quick Logout */}
            <button
              type="button"
              onClick={() => {
                logoutPilotUser()
                navigate('/login')
              }}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Logged-in Team Leader Card (Desktop Sidebar) */}
          <div className="hidden lg:block mx-4 mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                {tlProfile.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">{tlProfile.fullName}</p>
                <p className="text-[11px] text-indigo-300 truncate">{tlProfile.title}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>System Online</span>
              </span>
              <span>Operations Lead</span>
            </div>
          </div>

          {/* Navigation Menu (Horizontal Scroll on Mobile, Vertical on Desktop) */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar p-2.5 lg:p-3 lg:space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`shrink-0 lg:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 lg:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`shrink-0 lg:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 lg:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'queue'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 shrink-0" />
                <span>Verification Queue</span>
              </span>
              {counts.pending > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                  {counts.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`shrink-0 lg:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 lg:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'roster'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>Team Roster</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-emerald-400">
                {counts.approved}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`shrink-0 lg:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 lg:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'whatsapp'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>WhatsApp Bookings</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                {waBookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`shrink-0 lg:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 lg:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <UserCog className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="hidden lg:flex flex-col gap-2 p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Onboard Verified Partner</span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Marketplace</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logoutPilotUser()
                navigate('/login')
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN COMMAND WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Command Status Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white">
              {activeTab === 'overview' && 'Executive Command Overview'}
              {activeTab === 'queue' && 'Agent & Landlord Verification Queue'}
              {activeTab === 'roster' && 'Verified Partners & Campus Directory'}
              {activeTab === 'whatsapp' && 'Student WhatsApp Inspection Bookings'}
              {activeTab === 'profile' && 'Team Leader Profile & Verification Settings'}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Signed in as {session?.fullName || tlProfile.fullName} ({tlProfile.email})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refreshData(filter)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              title="Refresh applications and bookings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="lg:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Onboard</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs((v) => !v)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifData.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                    {notifData.unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      Team Leader Alerts ({notifData.unreadCount} Unread)
                    </span>
                    {notifData.unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          markAllTeamLeaderNotificationsRead()
                          setNotifData(getTeamLeaderNotifications())
                        }}
                        className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {notifData.items.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-500">No notifications yet</p>
                    ) : (
                      notifData.items.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setActiveTab('queue')
                            setFilter('pending')
                            setShowNotifs(false)
                          }}
                          className={`p-3.5 text-xs cursor-pointer hover:bg-slate-800/60 ${
                            n.readAt ? 'bg-slate-900' : 'bg-indigo-950/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-white">{n.title}</span>
                            {!n.readAt && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-400 leading-relaxed">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Feedback Toast */}
        {feedback && (
          <div className="mx-4 sm:mx-8 mt-4">
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/90 border-red-500/40 text-red-200'
              }`}
            >
              <span className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                {feedback.message}
              </span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 1: COMMAND OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-8 space-y-6 max-w-6xl">
            {/* Executive Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border border-indigo-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Partner Verification Active
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, {tlProfile.fullName.split(' ')[0]}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Every Agent and Landlord who registers is held in the verification queue until you confirm their ID card and phone number. Unapproved accounts cannot publish listings.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('queue')
                    setFilter('pending')
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer shadow-md"
                >
                  <Clock className="w-4 h-4" />
                  <span>Review Pending ({counts.pending})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Onboard Partner</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => {
                  setActiveTab('queue')
                  setFilter('pending')
                }}
                className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">{counts.pending}</p>
                <p className="text-[11px] text-slate-400 mt-1">Click to verify ID &amp; phone</p>
              </div>

              <div
                onClick={() => setActiveTab('roster')}
                className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Verified Partners</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">{counts.approved}</p>
                <p className="text-[11px] text-slate-400 mt-1">Authorized to list rooms</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-indigo-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Campus Students</span>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">{students.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Active student accounts</p>
              </div>

              <div
                onClick={() => {
                  setActiveTab('queue')
                  setFilter('rejected')
                }}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-rose-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Blocked / Rejected</span>
                  <Ban className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">
                  {counts.rejected + counts.suspended}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Blocked from listing</p>
              </div>
            </div>

            {/* Pending Signups Preview */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Immediate Action Required — Pending Partner Signups ({counts.pending})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Agents and Landlords waiting for your manual verification
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('queue')
                    setFilter('pending')
                  }}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Open Full Queue →
                </button>
              </div>

              <div className="divide-y divide-slate-800">
                {allApps.filter((a) => a.status === 'pending').length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      There are no pending Agent or Landlord applications right now.
                    </p>
                  </div>
                ) : (
                  allApps
                    .filter((a) => a.status === 'pending')
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40"
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={app.idCardImageUrl}
                            alt={app.fullName}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-white">{app.fullName}</h4>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  app.agentKind === 'landlord'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {app.agentKind}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {app.phoneNumber} • {app.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewIdApp(app)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                          >
                            Inspect ID
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(app)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer"
                          >
                            Approve Now
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: VERIFICATION QUEUE ── */}
        {activeTab === 'queue' && (
          <div className="p-4 sm:p-8 space-y-6 max-w-6xl">
            {/* Lodge Verification Requests from team agents & landlords */}
            <div className="rounded-2xl bg-slate-900 border border-amber-500/30 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white">
                  Lodge Verification Requests ({pendingLodges.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Visit the lodge, then tap Verify to show the Verified badge to UNIPORT students.
                </p>
              </div>
              {pendingLodges.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500">No lodges waiting for a visit.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {pendingLodges.map((l) => (
                    <div key={l.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{l.title}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {l.landmark} • ₦{l.price.toLocaleString()}/{l.period} • {l.uploaderName}
                        </p>
                        {l.verificationRequestNote && (
                          <p className="text-[11px] text-slate-500 mt-0.5">“{l.verificationRequestNote}”</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          approveListingVerification(l.id, tlProfile.fullName)
                          showToast('success', `"${l.title}" is now Verified.`)
                          refreshData(filter)
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer shrink-0"
                      >
                        Verify Lodge
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'pending', label: 'Pending Review', count: counts.pending },
                  { id: 'approved', label: 'Approved & Active', count: counts.approved },
                  { id: 'rejected', label: 'Rejected', count: counts.rejected },
                  { id: 'suspended', label: 'Suspended', count: counts.suspended },
                  {
                    id: 'all',
                    label: 'All Applications',
                    count:
                      counts.pending + counts.approved + counts.rejected + counts.suspended,
                  },
                ] as const
              ).map((tab) => {
                const active = filter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        active ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {items.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
                <Clock className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-extrabold text-white">
                  No {filter === 'all' ? '' : filter} applications found
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When new Agents or Landlords register on `/signup/agent` or `/signup/landlord`, they appear here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((app) => {
                  const isBusy = actionBusyId === app.id
                  return (
                    <div
                      key={app.id}
                      className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row gap-6 justify-between"
                    >
                      {/* Left: Applicant Details */}
                      <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
                        <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 group">
                          {app.idCardImageUrl ? (
                            <>
                              <img
                                src={app.idCardImageUrl}
                                alt={`${app.fullName} ID`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewIdApp(app)}
                                className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold cursor-pointer"
                              >
                                <Eye className="w-4 h-4" /> Inspect ID
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                              No ID Photo
                            </div>
                          )}
                          <span className="absolute top-2 left-2 bg-slate-950/85 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            ID Card
                          </span>
                        </div>

                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-extrabold text-white">{app.fullName}</h3>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                app.agentKind === 'landlord'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              }`}
                            >
                              {app.agentKind === 'landlord' ? (
                                <Building2 className="w-3 h-3" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              {app.agentKind === 'landlord' ? 'Direct Landlord' : 'Campus Agent'}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                app.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : app.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          {app.agencyName && (
                            <p className="text-xs font-semibold text-slate-300">
                              Organization / Lodge:{' '}
                              <span className="text-white">{app.agencyName}</span>
                            </p>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                            <a
                              href={`tel:${app.phoneNumber}`}
                              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {app.phoneNumber}
                            </a>
                            <a
                              href={`mailto:${app.email}`}
                              className="inline-flex items-center gap-1 text-slate-400 hover:underline"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {app.email}
                            </a>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {app.coverageAreas.map((area) => (
                              <span
                                key={area}
                                className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium"
                              >
                                {locationLabel(area)}
                              </span>
                            ))}
                          </div>

                          {app.rejectionReason && (
                            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                              <strong>Note:</strong> {app.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Team Leader Actions */}
                      <div className="flex flex-col justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 lg:w-64 shrink-0">
                        <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs font-semibold text-slate-300">
                          <input
                            type="checkbox"
                            checked={app.phoneContacted}
                            onChange={() => handleToggleContacted(app)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                          <span>Phone / WhatsApp Verified</span>
                        </label>

                        <div className="flex flex-wrap lg:flex-col gap-2">
                          {app.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleApprove(app)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve {app.agentKind === 'landlord' ? 'Landlord' : 'Agent'}</span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  setRejectTarget({ app, mode: 'reject' })
                                  setRejectReason('')
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {app.status === 'approved' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setRejectTarget({ app, mode: 'suspend' })
                                setRejectReason('')
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                            >
                              <Ban className="w-4 h-4" />
                              <span>Suspend Partner</span>
                            </button>
                          )}

                          {(app.status === 'rejected' || app.status === 'suspended') && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleReinstate(app)}
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Reinstate &amp; Approve</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: ACTIVE TEAM ROSTER & CAMPUS DIRECTORY ── */}
        {activeTab === 'roster' && (
          <div className="p-4 sm:p-8 space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search verified agents & landlords by name, phone, or lodge..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Onboard Verified Partner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoster.map((partner) => (
                <div
                  key={partner.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={partner.idCardImageUrl}
                      alt={partner.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-extrabold text-white">{partner.fullName}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Check className="w-3 h-3" /> Verified {partner.agentKind}
                        </span>
                      </div>
                      {partner.agencyName && (
                        <p className="text-xs font-semibold text-indigo-300 mt-0.5">
                          {partner.agencyName}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {partner.phoneNumber} • {partner.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {partner.coverageAreas.map((c) => (
                          <span
                            key={c}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {locationLabel(c)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Registered Students Section */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Registered Campus Students ({students.length})</span>
                </h3>
              </div>
              <div className="divide-y divide-slate-800">
                {students.map((st) => (
                  <div
                    key={st.userId}
                    className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{st.fullName}</span>
                      <span className="text-slate-400 ml-2">({st.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                        {st.matricNumber}
                      </span>
                      <span className="text-slate-400">
                        {CAMPUSES.find((c) => c.id === st.campus)?.shortCode || st.campus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: TEAM LEADER PROFILE & SETTINGS ── */}
        {activeTab === 'profile' && (
          <div className="p-4 sm:p-8 max-w-2xl">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-base font-extrabold text-white">
                  Team Leader Profile &amp; Verification Contact
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your details are displayed to pending Agents and Landlords on their verification status page.
                </p>
              </div>

              <form onSubmit={handleSaveTeamLeaderProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Team Leader Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Role / Operations Title
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Login Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Official Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      WhatsApp Verification Line
                    </label>
                    <input
                      type="tel"
                      value={profileForm.whatsappSupport}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, whatsappSupport: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Operations Hub Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profileForm.officeLocation}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, officeLocation: e.target.value })
                        }
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold cursor-pointer shadow-md"
                  >
                    Save Team Leader Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 5: STUDENT WHATSAPP BOOKINGS & VERIFIED ROSTER ── */}
        {activeTab === 'whatsapp' && (
          <div className="p-4 sm:p-8 space-y-6 max-w-6xl">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> WhatsApp Housing Assistant
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Student WhatsApp Inspection Bookings
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Students chat on WhatsApp to browse available houses, see transparent move-in costs, and book free physical inspections with your <strong>{counts.approved} verified agents and landlords</strong>.
                </p>
              </div>
              <Link
                to="/whatsapp-ai"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shrink-0 shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open WhatsApp Assistant</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Student WhatsApp Bookings for Verified Agents */}
              <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Confirmed WhatsApp Bookings ({waBookings.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Free physical walkthroughs scheduled by students on WhatsApp
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-800">
                  {waBookings.map((b) => (
                    <div key={b.id} className="p-5 space-y-2 hover:bg-slate-800/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-700">
                          Ref #{b.bookingRef}
                        </span>
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                          Slot: {b.preferredSlot}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white">{b.listingTitle}</h4>
                      <p className="text-xs text-slate-400">
                        📍 {b.landmark}
                        {b.totalMoveInCost > 0 && (
                          <span className="ml-2 text-emerald-300 font-bold">
                            • Total Move-In: ₦{b.totalMoveInCost.toLocaleString()}
                          </span>
                        )}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border-t border-slate-800/80">
                        <span>
                          👤 Verified Partner: <strong className="text-white">{b.agentName}</strong> ({b.agentPhone})
                        </span>
                        <span>
                          🎓 Student: <strong className="text-white">{b.studentName}</strong> ({b.studentPhone})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Active Verified Partners Available on WhatsApp */}
              <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Active Partners on WhatsApp ({approvedPartners.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Only partners you have approved appear to students on WhatsApp.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {approvedPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white truncate">
                            {partner.fullName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            {partner.agentKind === 'landlord' ? 'Landlord' : 'Agent'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {partner.phoneNumber} • {partner.agencyName || 'Verified Partner'}
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${partner.phoneNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-[11px] font-bold shrink-0"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Reject / Suspend Reason Modal ── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-white">
              {rejectTarget.mode === 'reject' ? 'Reject Application' : 'Suspend Account'} —{' '}
              {rejectTarget.app.fullName}
            </h3>
            <p className="text-xs text-slate-400">
              Provide a clear note so the {rejectTarget.app.agentKind} knows why their account was not approved:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Uploaded ID photo is blurry, or phone number could not be reached on WhatsApp."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectOrSuspend}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm {rejectTarget.mode === 'reject' ? 'Rejection' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ID Card Full Preview Modal ── */}
      {previewIdApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setPreviewIdApp(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-700 max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  {previewIdApp.fullName} — Submitted ID Card
                </h4>
                <p className="text-xs text-slate-400">{previewIdApp.phoneNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewIdApp(null)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewIdApp.idCardImageUrl}
                alt={previewIdApp.fullName}
                className="max-h-[60vh] rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Pre-Approved Partner Registration Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Onboard Pre-Verified Agent or Landlord
                </h3>
                <p className="text-xs text-slate-400">
                  Directly add a trusted partner to your pilot team. Their status is immediately set to{' '}
                  <strong className="text-emerald-400">APPROVED</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePreApproved} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                {(['agent', 'landlord'] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setNewPartner((p) => ({ ...p, agentKind: kind }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold capitalize cursor-pointer ${
                      newPartner.agentKind === kind
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    {kind === 'agent' ? 'Verified Agent' : 'Verified Landlord'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newPartner.fullName}
                  onChange={(e) => setNewPartner((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Tamunoemi Briggs"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPartner.phoneNumber}
                    onChange={(e) => setNewPartner((p) => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="e.g. 08023456789"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newPartner.email}
                    onChange={(e) => setNewPartner((p) => ({ ...p, email: e.target.value }))}
                    placeholder="e.g. tamuno@aroom.ng"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {newPartner.agentKind === 'landlord'
                      ? 'Property / Lodge Name'
                      : 'Agency Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newPartner.agencyName}
                    onChange={(e) => setNewPartner((p) => ({ ...p, agencyName: e.target.value }))}
                    placeholder="e.g. Royal Campus Lodge"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartner.password}
                    onChange={(e) => setNewPartner((p) => ({ ...p, password: e.target.value }))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer"
                >
                  Create &amp; Approve Immediately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

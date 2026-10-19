import axios from 'axios'
import type { Listing } from '@/components/shared/ListingCard'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

// ── Session token (JWT) ──────────────────────────────────────────────────────
export const TOKEN_KEY = 'aroom_token'
export const UNAUTHORIZED_EVENT = 'aroom:unauthorized'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// A 401 on a protected call means the session expired: tell the AuthProvider.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const url: string = err?.config?.url || ''
    if (err?.response?.status === 401 && getToken() && !url.startsWith('/auth/login')) {
      setToken(null)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(err)
  }
)

/** Turns an axios error into a readable message from the backend. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as any
  if (e?.response?.data?.error) return String(e.response.data.error)
  if (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error') return 'Cannot reach the server. Check your connection.'
  return fallback
}

export type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'suspended' | null
export interface SessionUser {
  id: string
  role: 'student' | 'non_student' | 'agent' | 'admin'
  phoneNumber: string
  fullName: string | null
  agentProfileId: string | null
  agentKind: 'agent' | 'landlord' | null
  approvalStatus: ApprovalStatus
  rejectionReason: string | null
}

export interface AgentApplication {
  agentProfileId: string
  userId: string
  fullName: string
  agencyName: string | null
  phoneNumber: string
  agentKind: 'agent' | 'landlord'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  phoneContacted: boolean
  rejectionReason: string | null
  reviewedAt: string | null
  createdAt: string
  listingCount: number
  idCardImageUrl?: string | null
}

export interface AppNotification {
  id: string
  type: string
  title: string
  body?: string
  readAt?: string
  createdAt: string
  payload?: Record<string, any>
}

// MOCK SEED FALLBACK (Used if backend server is unreachable)
export const FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    title: 'Standard Executive Self-Contain (Serviced water + prepaid meter)',
    price: 350000,
    period: 'yr',
    landmark: 'Choba Gate (5 mins walk)',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    title: 'Budget Single Room in Abule Oja',
    price: 180000,
    period: 'yr',
    landmark: 'Abule Oja Junction',
    verificationStatus: 'unverified_new',
    availabilityStatus: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    title: 'Modern Shared 2-Bedroom Flat in Onike',
    price: 280000,
    period: 'yr',
    landmark: 'Onike Roundabout',
    verificationStatus: 'verified',
    availabilityStatus: 'held',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
  },
]

export function toFrontendListing(item: any): Listing {
  return {
    id: String(item.id),
    title: item.title || 'Untitled Accommodation',
    price:
      item.priceAnnualNaira !== undefined
        ? item.priceAnnualNaira
        : item.priceAnnualKobo !== undefined
        ? Math.round(item.priceAnnualKobo / 100)
        : typeof item.price === 'number'
        ? item.price
        : 0,
    period: item.period || 'yr',
    landmark: item.landmarkVicinity || item.landmark || 'Near Campus',
    verificationStatus: item.verificationStatus === 'verified' ? 'verified' : 'unverified_new',
    availabilityStatus:
      item.availabilityStatus === 'held'
        ? 'held'
        : item.availabilityStatus === 'taken'
        ? 'taken'
        : 'available',
    imageUrl:
      item.primaryPhotoUrl ||
      item.imageUrl ||
      (item.media && item.media[0]?.mediaUrl) ||
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
  }
}

export interface SearchFilters {
  campus_code?: string
  campus_id?: string
  min_budget?: number
  max_budget?: number
  room_type?: 'self_contain' | 'single_room' | 'flat_shared' | 'flat_entire'
  only_verified?: boolean
  status?: 'available' | 'held' | 'taken'
}

export const api = {
  // 1. Listings
  async getListings(filters: SearchFilters = {}): Promise<Listing[]> {
    try {
      const res = await apiClient.get('/listings/search', { params: filters })
      if (res.data?.success && res.data?.data?.items) {
        return res.data.data.items.map(toFrontendListing)
      }
      return FALLBACK_LISTINGS
    } catch (err) {
      console.warn('[Aroom API] Failed to fetch live listings, using fallback seeds:', err)
      return FALLBACK_LISTINGS
    }
  },

  async getListingById(id: string): Promise<any | null> {
    try {
      const res = await apiClient.get(`/listings/${id}`)
      if (res.data?.success && res.data?.data) {
        return res.data.data
      }
      return null
    } catch (err) {
      console.warn(`[Aroom API] Failed to fetch listing ${id}:`, err)
      // Check fallback
      const match = FALLBACK_LISTINGS.find((l) => l.id === id)
      if (match) {
        return {
          id: match.id,
          title: match.title,
          priceAnnualNaira: match.price,
          landmarkVicinity: match.landmark,
          verificationStatus: match.verificationStatus,
          availabilityStatus: match.availabilityStatus,
          description:
            'A very spacious and clean room near campus with running water and prepaid meter. Close to university main gate.',
          primaryPhotoUrl: match.imageUrl,
          agent: {
            name: 'David Opubo',
            trustTier: 'gold',
            trustScore: 96.5,
            responseRatePct: 98,
          },
        }
      }
      return null
    }
  },

  async createListing(payload: {
    campusId: string
    title: string
    description: string
    roomType: 'self_contain' | 'single_room' | 'flat_shared' | 'flat_entire'
    priceAnnualNaira: number
    landmarkVicinity: string
    moveInDate: string
    photos?: Array<{ url: string; isLiveUpload?: boolean }>
  }): Promise<any> {
    const res = await apiClient.post('/listings', payload)
    return res.data
  },

  async updateListingStatus(
    listingId: string,
    status: 'available' | 'held' | 'taken',
    reason?: string
  ): Promise<any> {
    const res = await apiClient.patch(`/listings/${listingId}/status`, { status, reason })
    return res.data
  },

  async requestVerification(listingId: string): Promise<any> {
    const res = await apiClient.post(`/listings/${listingId}/request-verification`)
    return res.data
  },

  // 2. Campuses
  async getCampuses(): Promise<Array<{ id: string; name: string; shortCode: string; city: string }>> {
    try {
      const res = await apiClient.get('/campuses')
      if (res.data?.success && res.data?.data) {
        return res.data.data
      }
      return [{ id: 'c1111111-1111-1111-1111-111111111111', name: 'University of Port Harcourt', shortCode: 'UNIPORT', city: 'Port Harcourt' }]
    } catch {
      return [{ id: 'c1111111-1111-1111-1111-111111111111', name: 'University of Port Harcourt', shortCode: 'UNIPORT', city: 'Port Harcourt' }]
    }
  },

  // 3. Inquiries
  async bookInspection(payload: {
    listingId: string
    inspectionSlot?: string
    studentNote?: string
  }): Promise<any> {
    const res = await apiClient.post('/inquiries', {
      ...payload,
      sourceChannel: 'web',
    })
    return res.data
  },

  // 4. Auth & Agent / Landlord onboarding (pilot: no OTP, Team Leader approval)
  async uploadIdPhoto(file: File): Promise<string> {
    const dataBase64: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
      reader.onerror = () => reject(new Error('Could not read the photo.'))
      reader.readAsDataURL(file)
    })
    const res = await apiClient.post('/auth/upload-id', { contentType: file.type, dataBase64 })
    return res.data.data.idCardImageUrl as string
  },

  async partnerSignup(payload: {
    fullName: string
    phoneNumber: string
    email?: string
    password: string
    agentKind: 'agent' | 'landlord'
    idCardImageUrl: string
    agencyName?: string
  }): Promise<{ token: string; status: 'pending'; agentProfileId: string }> {
    const res = await apiClient.post('/auth/agent/signup', payload)
    return res.data.data
  },

  async login(identifier: string, password: string): Promise<{ token: string; me: SessionUser }> {
    const res = await apiClient.post('/auth/login', { identifier, password })
    return res.data.data
  },

  async me(): Promise<SessionUser> {
    const res = await apiClient.get('/auth/me')
    return res.data.data
  },

  // 5. Team Leader (admin)
  async listApplications(status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'all') {
    const res = await apiClient.get('/admin/agents', { params: { status } })
    return res.data.data as {
      counts: Record<'pending' | 'approved' | 'rejected' | 'suspended', number>
      items: AgentApplication[]
    }
  },

  async getApplication(id: string): Promise<AgentApplication> {
    const res = await apiClient.get(`/admin/agents/${id}`)
    return res.data.data
  },

  async approveApplication(id: string, phoneContacted?: boolean) {
    const res = await apiClient.post(`/admin/agents/${id}/approve`, { phoneContacted })
    return res.data.data as AgentApplication
  },

  async rejectApplication(id: string, reason: string) {
    const res = await apiClient.post(`/admin/agents/${id}/reject`, { reason })
    return res.data.data as AgentApplication
  },

  async suspendApplication(id: string, reason?: string) {
    const res = await apiClient.post(`/admin/agents/${id}/suspend`, { reason })
    return res.data.data as AgentApplication
  },

  async reinstateApplication(id: string) {
    const res = await apiClient.post(`/admin/agents/${id}/reinstate`)
    return res.data.data as AgentApplication
  },

  async setPhoneContacted(id: string, value: boolean) {
    const res = await apiClient.patch(`/admin/agents/${id}/phone-contacted`, { value })
    return res.data.data as AgentApplication
  },

  async createApprovedAgent(payload: {
    fullName: string
    phoneNumber: string
    password: string
    agentKind: 'agent' | 'landlord'
    agencyName?: string
  }) {
    const res = await apiClient.post('/admin/agents', payload)
    return res.data.data as AgentApplication
  },

  // 6. Notifications
  async getNotifications() {
    const res = await apiClient.get('/notifications')
    return res.data.data as { unreadCount: number; items: AppNotification[] }
  },

  async markAllNotificationsRead() {
    await apiClient.post('/notifications/read-all')
  },
}
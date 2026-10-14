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

// MOCK SEED FALLBACK (Used if backend server is unreachable)
export const FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    title: 'Standard Executive Self-Contain (Serviced water + prepaid meter)',
    price: 350000,
    period: 'yr',
    landmark: 'Akoka Gate (5 mins walk)',
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
            name: 'Femi Ogundipe',
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
      return [{ id: 'c1111111-1111-1111-1111-111111111111', name: 'University of Lagos', shortCode: 'UNILAG', city: 'Yaba, Lagos' }]
    } catch {
      return [{ id: 'c1111111-1111-1111-1111-111111111111', name: 'University of Lagos', shortCode: 'UNILAG', city: 'Yaba, Lagos' }]
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

  // 4. Auth & Agent Onboarding
  async agentSignup(payload: {
    fullName: string
    phoneNumber: string
    idCardImageUrl: string
    agencyName?: string
  }): Promise<any> {
    const res = await apiClient.post('/auth/agent/signup', payload)
    return res.data
  },

  async verifyAgentOtp(phoneNumber: string, otp: string): Promise<any> {
    const res = await apiClient.post('/auth/agent/verify-otp', { phoneNumber, otp })
    return res.data
  },
}

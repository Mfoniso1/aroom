/**
 * listingsStore.ts
 * Unified store for Aroom listings.
 * - Stores mock seed listings.
 * - Stores user-uploaded listings with video blobs in browser IndexedDB.
 * - Emits reactive change events so Explore page and Detail pages update immediately.
 */
import { useState, useEffect } from 'react'
import type { Listing } from '@/components/shared/ListingCard'

export const SEED_LISTINGS: Listing[] = [
  {
    id: 'uniport-1',
    propertyPublicId: 'ARM-CHB-0141',
    unitPublicId: 'ARM-CHB-0141-U1',
    title: 'Executive Self-Contain in Choba',
    price: 280000,
    period: 'yr',
    landmark: '5 mins walk to UNIPORT Choba Gate',
    description: 'Tiled self-contain with treated borehole water, prepaid meter, and gated compound with night security. Quiet street, close to Choba Gate.',
    roomType: 'Self-Contain',
    verificationStatus: 'verified',
    conditionStatus: 'good',
    verifiedAt: '10 Oct 2026',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'landlord',
    uploaderName: 'Chief Emeka Nwosu (Direct Landlord)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 25000, legalFee: 20000, utilityFee: 15000, agencyFee: 0 },
  },
  {
    id: 'uniport-2',
    propertyPublicId: 'ARM-ALK-0082',
    unitPublicId: 'ARM-ALK-0082-U2',
    title: 'Modern Studio at Alakahia (UPTH Road)',
    price: 320000,
    period: 'yr',
    landmark: '8 mins to UPTH Gate & Delta Park',
    description: 'Studio apartment with borehole water, prepaid meter, and standby generator for the compound. Tarred access road.',
    roomType: 'Studio',
    verificationStatus: 'verified',
    conditionStatus: 'good',
    verifiedAt: '12 Oct 2026',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'agent',
    uploaderName: 'David Opubo (Verified Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 30000, legalFee: 20000, utilityFee: 15000, agencyFee: 48000 },
  },
  {
    id: 'uniport-3',
    propertyPublicId: 'ARM-BOC-0033',
    unitPublicId: 'ARM-BOC-0033-U1',
    title: 'Newly Built Self-Contain at Back of Chem',
    price: 240000,
    period: 'yr',
    landmark: 'Back of Chem, 6 mins to Abuja Campus',
    description: 'Newly built self-contain, treated borehole water, prepaid meter. Awaiting Aroom Team Lead physical verification.',
    roomType: 'Self-Contain',
    verificationStatus: 'unverified_new',
    conditionStatus: 'good',
    verificationRequested: true,
    verificationRequestedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    verificationRequestNote: 'Please inspect before we open to students.',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'agent',
    uploaderName: 'David Opubo (Verified Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 20000, legalFee: 15000, utilityFee: 10000, agencyFee: 36000 },
  },
  {
    id: 'uniport-4',
    propertyPublicId: 'ARM-OZU-0019',
    unitPublicId: 'ARM-OZU-0019-U1',
    title: '2-Bedroom Shared Flat in Ozuoba',
    price: 220000,
    period: 'yr',
    landmark: 'Near UNIPORT Abuja Campus Gate',
    description: 'Shared 2-bedroom flat for two students. Borehole water and prepaid meter. Landlord lives on the compound.',
    roomType: 'Shared Flat',
    verificationStatus: 'unverified_new',
    conditionStatus: 'good',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'landlord',
    uploaderName: 'Elder Nnamdi Wike (Direct Landlord)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 20000, legalFee: 15000, utilityFee: 10000, agencyFee: 0 },
  },
  {
    id: 'uniport-5',
    propertyPublicId: 'ARM-DTA-0051',
    unitPublicId: 'ARM-DTA-0051-U3',
    title: 'Standard Single Room at Delta Park',
    price: 160000,
    period: 'yr',
    landmark: '10 mins to Choba Gate, Delta Park',
    description: 'Affordable single room, shared bathroom, borehole water. Ideal for budget-conscious UNIPORT students.',
    roomType: 'Single Room',
    verificationStatus: 'verified',
    conditionStatus: 'good',
    verifiedAt: '14 Oct 2026',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'agent',
    uploaderName: 'David Opubo (Verified Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 15000, legalFee: 10000, utilityFee: 8000, agencyFee: 24000 },
  },
  {
    id: 'uniport-6',
    propertyPublicId: 'ARM-ALU-0014',
    unitPublicId: 'ARM-ALU-0014-U2',
    title: 'Spacious 2-Bedroom Flat in Aluu',
    price: 350000,
    period: 'yr',
    landmark: 'Aluu Junction, 15 mins to Abuja Campus',
    description: 'Large flat for two or three students sharing. Tiled floors, borehole water, prepaid meter, secure fence.',
    roomType: '2-Bedroom Flat',
    verificationStatus: 'verified',
    conditionStatus: 'good',
    verifiedAt: '15 Oct 2026',
    availabilityStatus: 'held',
    campusId: 'uniport',
    uploaderType: 'landlord',
    uploaderName: 'Chief Emeka Nwosu (Direct Landlord)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 30000, legalFee: 20000, utilityFee: 15000, agencyFee: 0 },
  },
  {
    id: 'uniport-7',
    propertyPublicId: 'ARM-RMU-0008',
    unitPublicId: 'ARM-RMU-0008-U1',
    title: 'Neat Self-Contain at Rumuosi',
    price: 200000,
    period: 'yr',
    landmark: 'Rumuosi, off East-West Road',
    description: 'Self-contain with tiled floor, borehole water and prepaid meter. Short bike ride to campus.',
    roomType: 'Self-Contain',
    verificationStatus: 'unverified_new',
    conditionStatus: 'good',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'agent',
    uploaderName: 'Tariye Briggs (Team Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    customFees: { cautionFee: 20000, legalFee: 15000, utilityFee: 10000, agencyFee: 30000 },
  },
]

// ── In-Memory Cache ──────────────────────────────────────────────────────────
let userListingsCache: Listing[] = []
let isInitialized = false

// ── IndexedDB Constants ──────────────────────────────────────────────────────
const DB_NAME = 'aroom_listings_db'
const DB_VERSION = 1
const STORE_NAME = 'uploaded_listings'

interface StoredRecord {
  id: string
  listing: Listing
  videoBlob?: Blob
  imageBlob?: Blob
  createdAt: number
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Hydrates uploaded listings from IndexedDB on startup
 */
export async function initListingsStore(): Promise<Listing[]> {
  if (isInitialized) return getAllListings()

  try {
    const db = await openDatabase()
    const records = await new Promise<StoredRecord[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })

    // Sort by createdAt desc
    records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    userListingsCache = records.map((rec) => {
      const item = { ...rec.listing }
      if (rec.videoBlob) {
        item.videoUrl = URL.createObjectURL(rec.videoBlob)
      }
      if (rec.imageBlob) {
        item.imageUrl = URL.createObjectURL(rec.imageBlob)
      }
      return item
    })

    isInitialized = true
    notifyListeners()
  } catch (err) {
    console.warn('Could not load from IndexedDB, using in-memory only', err)
    isInitialized = true
  }

  return getAllListings()
}

// Automatically initiate hydration in browser environment
if (typeof window !== 'undefined') {
  initListingsStore().catch(() => {})
}

function notifyListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aroom-listings-changed'))
  }
}

/**
 * Returns all current listings (User-uploaded first, then seed listings)
 */
export function getAllListings(): Listing[] {
  const overrides = loadVerificationOverrides()
  return [...userListingsCache, ...SEED_LISTINGS].map((l) =>
    overrides[l.id] ? { ...l, ...overrides[l.id] } : l
  )
}

// ── Team Lead Verification Requests ──────────────────────────────────────────
const VERIFY_KEY = 'aroom_listing_verification_uniport_v2'
type VerificationPatch = Partial<
  Pick<Listing, 'verificationStatus' | 'verificationRequested' | 'verificationRequestedAt' | 'verificationRequestNote' | 'verifiedBy'>
>

function loadVerificationOverrides(): Record<string, VerificationPatch> {
  try {
    return JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveVerificationOverride(id: string, patch: VerificationPatch) {
  const all = loadVerificationOverrides()
  all[id] = { ...all[id], ...patch }
  try {
    localStorage.setItem(VERIFY_KEY, JSON.stringify(all))
  } catch {
    // ignore quota error
  }
  notifyListeners()
}

/** Agent/landlord asks the Aroom Team Lead to physically verify a lodge */
export function requestListingVerification(id: string, note?: string) {
  saveVerificationOverride(id, {
    verificationRequested: true,
    verificationRequestedAt: new Date().toISOString(),
    verificationRequestNote: note?.trim() || undefined,
  })
}

/** Team Lead marks a lodge as physically verified */
export function approveListingVerification(id: string, verifierName = 'Aroom Team Lead') {
  saveVerificationOverride(id, {
    verificationStatus: 'verified',
    verificationRequested: false,
    verifiedBy: verifierName,
  })
}

/** Listings (unverified) that have a pending verification request */
export function getPendingVerificationListings(): Listing[] {
  return getAllListings().filter((l) => l.verificationStatus === 'unverified_new' && l.verificationRequested)
}

/**
 * Resolves a listing by ID
 */
export function getListingById(id: string): Listing | undefined {
  return getAllListings().find((l) => l.id === id)
}

/**
 * Adds a new user-uploaded listing with video & optional photo blobs
 */
export async function addCustomListing(
  listing: Listing,
  videoBlob?: Blob,
  imageBlob?: Blob
): Promise<Listing> {
  // Ensure video URL is an object URL if blob is supplied
  const itemToStore: Listing = { ...listing }
  if (videoBlob) {
    itemToStore.videoUrl = URL.createObjectURL(videoBlob)
    itemToStore.hasVideoTour = true
  }
  if (imageBlob) {
    itemToStore.imageUrl = URL.createObjectURL(imageBlob)
  }

  // Prepend to in-memory cache so it appears first on Explore page immediately
  userListingsCache = [itemToStore, ...userListingsCache.filter((l) => l.id !== itemToStore.id)]
  notifyListeners()

  // Persist to IndexedDB
  try {
    const db = await openDatabase()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const record: StoredRecord = {
      id: itemToStore.id,
      listing: { ...itemToStore },
      videoBlob,
      imageBlob,
      createdAt: Date.now(),
    }
    store.put(record)
  } catch (err) {
    console.error('Failed to persist listing in IndexedDB', err)
  }

  return itemToStore
}

/**
 * React hook to access and subscribe to listings updates
 */
export function useListings() {
  const [listings, setListings] = useState<Listing[]>(getAllListings())

  useEffect(() => {
    const handleUpdate = () => {
      setListings(getAllListings())
    }

    // Subscribe to updates
    window.addEventListener('aroom-listings-changed', handleUpdate)

    // Initial sync
    setListings(getAllListings())

    return () => {
      window.removeEventListener('aroom-listings-changed', handleUpdate)
    }
  }, [])

  return {
    listings,
    addListing: addCustomListing,
  }
}

/**
 * Helper: Extracts the initial view (first frame) of a video as the cover page data URI
 */
export function extractThumbnailFromVideo(videoFile: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video')
      const blobUrl = URL.createObjectURL(videoFile)
      video.src = blobUrl
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'

      video.onloadeddata = () => {
        // Capture initial view (very start of the video)
        video.currentTime = 0.05
      }

      video.onseeked = () => {
        try {
          const width = video.videoWidth || 1280
          const height = video.videoHeight || 720
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
            URL.revokeObjectURL(blobUrl)
            resolve(dataUrl)
            return
          }
        } catch (e) {
          console.warn('Canvas capture error:', e)
        }
        URL.revokeObjectURL(blobUrl)
        resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop')
      }

      video.onerror = () => {
        URL.revokeObjectURL(blobUrl)
        resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop')
      }
    } catch {
      resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop')
    }
  })
}

// ── Duplicate Prevention Model (Engineering Brief Section 6) ──────────────────
export interface DuplicateCandidate {
  id: string
  publicId?: string
  name: string
  landmark: string
  imageUrl: string
  uploaderName?: string
  confidenceReason: string
}

/**
 * Checks for already-mapped lodges near the given landmark / name / phone
 */
export function checkPropertyDuplicates(
  name: string,
  landmark: string,
  _ownerPhone?: string
): DuplicateCandidate[] {
  const all = getAllListings()
  const candidates: DuplicateCandidate[] = []
  const cleanName = name.toLowerCase().trim()
  const cleanLandmark = landmark.toLowerCase().trim()

  for (const item of all) {
    const itemTitle = item.title.toLowerCase()
    const itemLandmark = item.landmark.toLowerCase()

    let matchReason = ''
    if (cleanName && itemTitle.includes(cleanName)) {
      matchReason = 'Similar lodge title in same area'
    } else if (cleanLandmark && itemLandmark.includes(cleanLandmark)) {
      matchReason = 'Identical campus landmark / proximity'
    }

    if (matchReason) {
      candidates.push({
        id: item.id,
        publicId: item.propertyPublicId || `ARM-CHB-${item.id.replace(/\D/g, '') || '0140'}`,
        name: item.title,
        landmark: item.landmark,
        imageUrl: item.imageUrl,
        uploaderName: item.uploaderName,
        confidenceReason: matchReason,
      })
    }
  }

  return candidates.slice(0, 3)
}


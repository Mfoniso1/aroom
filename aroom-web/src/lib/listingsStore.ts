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
    id: '1',
    title: 'Spacious Self-Contain at Akoka',
    price: 350000,
    period: 'yr',
    landmark: '5 mins walk from UNILAG Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'unilag',
    uploaderType: 'agent',
    uploaderName: 'Femi K. (Certified Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 30000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 52500, // 15% of 350,000
      inspectionFee: 0,
    },
  },
  {
    id: '4',
    title: 'Executive Self-Contain in Choba',
    price: 280000,
    period: 'yr',
    landmark: '5 mins to UNIPORT Choba Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'landlord',
    uploaderName: 'Chief Emeka Eze (Property Owner)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 25000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 0, // Direct landlord
      inspectionFee: 0,
    },
  },
  {
    id: '5',
    title: 'Modern Studio Apartment at Alakahia',
    price: 320000,
    period: 'yr',
    landmark: 'Close to UNIPORT Delta Park',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'agent',
    uploaderName: 'David O. (UNIPORT Verified Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 30000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 48000, // 15% of 320,000
      inspectionFee: 3000,
    },
  },
  {
    id: '7',
    title: '2-Bedroom Shared Flat in Ozuoba',
    price: 220000,
    period: 'yr',
    landmark: 'Near UNIPORT Abuja Campus Gate',
    verificationStatus: 'unverified_new',
    availabilityStatus: 'available',
    campusId: 'uniport',
    uploaderType: 'landlord',
    uploaderName: 'Elder Nnamdi (Lodge Landlord)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 0, // Direct landlord
      inspectionFee: 0,
    },
  },
  {
    id: '2',
    title: 'Standard Single Room in Yaba',
    price: 180000,
    period: 'yr',
    landmark: 'Near Yabatech Back Gate / UNILAG',
    verificationStatus: 'unverified_new',
    availabilityStatus: 'available',
    campusId: 'unilag',
    uploaderType: 'agent',
    uploaderName: 'Blessing A. (Lagos Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 27000, // 15% of 180,000
      inspectionFee: 2000,
    },
  },
  {
    id: '3',
    title: '2-Bedroom Shared Flat Onike',
    price: 450000,
    period: 'yr',
    landmark: 'Onike roundabout near UNILAG',
    verificationStatus: 'verified',
    availabilityStatus: 'held',
    campusId: 'unilag',
    uploaderType: 'landlord',
    uploaderName: 'Dr. (Mrs) Johnson (Property Owner)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 40000,
      legalFee: 25000,
      utilityFee: 20000,
      agencyFee: 0, // Direct landlord
      inspectionFee: 0,
    },
  },
  {
    id: '6',
    title: 'Serviced Room near Ekosodin Gate',
    price: 210000,
    period: 'yr',
    landmark: 'Ekosodin, UNIBEN Main Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniben',
    uploaderType: 'agent',
    uploaderName: 'Victor E. (Benin Campus Agent)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 31500, // 15% of 210,000
      inspectionFee: 2500,
    },
  },
  {
    id: '8',
    title: 'Self-Contain Apartment at BDPA',
    price: 260000,
    period: 'yr',
    landmark: 'BDPA Estate, Ugbowo (UNIBEN)',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniben',
    uploaderType: 'landlord',
    uploaderName: 'Pastor Osa (Direct Landlord)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 25000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 0, // Direct landlord
      inspectionFee: 0,
    },
  },
  {
    id: '9',
    title: 'Charming Studio in Agbowo',
    price: 250000,
    period: 'yr',
    landmark: 'Walking distance to UI Main Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'ui',
    uploaderType: 'landlord',
    uploaderName: 'Prof. Adeleke (Lodge Landlord)',
    hasVideoTour: true,
    videoUrl: '/videos/room-tour.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 0, // Direct landlord
      inspectionFee: 0,
    },
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
  return [...userListingsCache, ...SEED_LISTINGS]
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

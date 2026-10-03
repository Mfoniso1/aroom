// ==============================================================================
// Aroom Domain Types & Entities
// ==============================================================================

export type UserType = 'student' | 'non_student' | 'agent' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification';
export type RoomType = 'self_contain' | 'single_room' | 'flat_shared' | 'flat_entire';
export type AvailabilityStatus = 'available' | 'held' | 'taken';
export type VerificationStatus = 'unverified_new' | 'pending_inspection' | 'verified' | 'rejected';
export type TrustTier = 'bronze' | 'silver' | 'gold';
export type InquiryStatus = 'requested' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no_show';
export type SourceChannel = 'whatsapp' | 'web';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  passwordHash?: string;
  userType: UserType;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  campusId: string;
  matricNumber?: string;
  institutionalEmail?: string;
  studentIdImageUrl?: string;
  isInstitutionVerified: boolean;
  verifiedAt?: Date;
}

export interface AgentProfile {
  id: string;
  userId: string;
  fullName: string;
  agencyName?: string;
  idCardImageUrl: string;
  isPhoneVerified: boolean;
  trustTier: TrustTier;
  trustScore: number; // 0.00 - 100.00
  totalInspections: number;
  successfulDeals: number;
  noShowCount: number;
  responseRatePct: number;
  createdAt: Date;
}

export interface Campus {
  id: string;
  name: string;
  shortCode: string;
  city: string;
  state: string;
  institutionalEmailDomains: string[];
  geographicBoundaries: {
    center: [number, number];
    radiusKm: number;
    popularLandmarks: string[];
  };
  createdAt: Date;
}

export interface ListingMedia {
  id: string;
  listingId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isLiveUpload: boolean;
  exifGeoMetadata?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  sortOrder: number;
}

export interface Listing {
  id: string;
  agentId: string;
  campusId: string;
  title: string;
  description: string;
  roomType: RoomType;
  priceAnnualKobo: number; // Stored in Kobo (1 NGN = 100 Kobo)
  priceMonthlyKobo?: number;
  landmarkVicinity: string;
  coordinates?: [number, number];
  moveInDate: Date;
  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  isBoosted: boolean;
  boostedUntil?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  media?: ListingMedia[];
  agent?: AgentProfile;
}

export interface Inquiry {
  id: string;
  listingId: string;
  studentId: string;
  agentId: string;
  sourceChannel: SourceChannel;
  status: InquiryStatus;
  inspectionSlot?: Date;
  studentNote?: string;
  agentNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityReport {
  id: string;
  listingId: string;
  reporterUserId: string;
  reportedStatus: AvailabilityStatus;
  comments?: string;
  aiSentimentScore?: number;
  isResolved: boolean;
  createdAt: Date;
}

export interface InspectionReview {
  id: string;
  inquiryId: string;
  listingId: string;
  studentId: string;
  agentId: string;
  ratingStars: number;
  visitedProperty: boolean;
  accuratelyDescribed: boolean;
  agentShowedUp: boolean;
  reviewNotes?: string;
  createdAt: Date;
}

export interface ConversationSession {
  id: string;
  whatsappPhone: string;
  userId?: string;
  currentState: string;
  contextSlots: {
    campusShortCode?: string;
    maxBudgetKobo?: number;
    roomType?: RoomType;
    moveInTiming?: string;
    selectedListingId?: string;
    [key: string]: any;
  };
  lastInteractionAt: Date;
  expiresAt: Date;
}

export interface AuditLog {
  id: string;
  entityName: string;
  entityId: string;
  actorId?: string;
  actionType: string;
  stateBefore?: Record<string, any>;
  stateAfter?: Record<string, any>;
  createdAt: Date;
}

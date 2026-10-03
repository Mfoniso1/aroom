// ==============================================================================
// Aroom: Listing Domain Service
// Shared by Web Dashboard and WhatsApp Bot
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/store.js';
import { Listing, RoomType, AvailabilityStatus, VerificationStatus } from '../entities/types.js';

export interface SearchListingFilters {
  campusId?: string;
  campusShortCode?: string;
  minBudgetKobo?: number;
  maxBudgetKobo?: number;
  roomType?: RoomType;
  moveInBefore?: Date;
  onlyVerified?: boolean;
  status?: AvailabilityStatus;
  limit?: number;
  offset?: number;
}

export interface CreateListingInput {
  campusId: string;
  title: string;
  description: string;
  roomType: RoomType;
  priceAnnualNaira: number; // Input in Naira, converted to Kobo
  priceMonthlyNaira?: number;
  landmarkVicinity: string;
  moveInDate: Date;
  photos?: Array<{
    url: string;
    isLiveUpload?: boolean;
    exifGeoMetadata?: { latitude: number; longitude: number; timestamp: string };
  }>;
}

export class ListingService {
  /**
   * Universal search query used by both Web and WhatsApp bot.
   */
  public async search(filters: SearchListingFilters) {
    let allListings = Array.from(db.listings.values());

    // Resolve campus short code to ID if provided
    let targetCampusId = filters.campusId;
    if (!targetCampusId && filters.campusShortCode) {
      const code = filters.campusShortCode.toUpperCase();
      for (const campus of db.campuses.values()) {
        if (campus.shortCode === code) {
          targetCampusId = campus.id;
          break;
        }
      }
    }

    // Filter by Campus
    if (targetCampusId) {
      allListings = allListings.filter((l) => l.campusId === targetCampusId);
    }

    // Filter by Availability (Default: available)
    const targetStatus = filters.status || 'available';
    allListings = allListings.filter((l) => l.availabilityStatus === targetStatus);

    // Filter by Verification Status if requested
    if (filters.onlyVerified) {
      allListings = allListings.filter((l) => l.verificationStatus === 'verified');
    }

    // Filter by Room Type
    if (filters.roomType) {
      allListings = allListings.filter((l) => l.roomType === filters.roomType);
    }

    // Filter by Budget (converted to Kobo)
    if (filters.maxBudgetKobo !== undefined) {
      allListings = allListings.filter((l) => l.priceAnnualKobo <= filters.maxBudgetKobo!);
    }
    if (filters.minBudgetKobo !== undefined) {
      allListings = allListings.filter((l) => l.priceAnnualKobo >= filters.minBudgetKobo!);
    }

    // Filter by Move-in Date
    if (filters.moveInBefore) {
      allListings = allListings.filter((l) => new Date(l.moveInDate) <= filters.moveInBefore!);
    }

    // Sorting: Boosted first, then Verified, then newest
    allListings.sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
      if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    const paginated = allListings.slice(offset, offset + limit);

    // Hydrate listing cards with agent details and media
    const results = paginated.map((listing) => {
      const agent = db.agentProfiles.get(listing.agentId);
      const media = db.listingMedia.get(listing.id) || [];
      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        roomType: listing.roomType,
        priceAnnualNaira: listing.priceAnnualKobo / 100,
        priceAnnualKobo: listing.priceAnnualKobo,
        landmarkVicinity: listing.landmarkVicinity,
        moveInDate: listing.moveInDate,
        availabilityStatus: listing.availabilityStatus,
        verificationStatus: listing.verificationStatus,
        isBoosted: listing.isBoosted,
        viewCount: listing.viewCount,
        createdAt: listing.createdAt,
        primaryPhotoUrl: media.length > 0 ? media[0].mediaUrl : null,
        mediaCount: media.length,
        agent: agent
          ? {
              id: agent.id,
              name: agent.fullName,
              agencyName: agent.agencyName,
              trustTier: agent.trustTier,
              trustScore: agent.trustScore,
              responseRatePct: agent.responseRatePct,
              totalInspections: agent.totalInspections,
            }
          : null,
      };
    });

    return {
      total: allListings.length,
      limit,
      offset,
      items: results,
    };
  }

  /**
   * Get single listing detail with full media gallery and agent verification ledger.
   */
  public async getById(listingId: string) {
    const listing = db.listings.get(listingId);
    if (!listing) {
      throw new Error(`Listing not found with ID: ${listingId}`);
    }

    // Increment view count
    listing.viewCount += 1;

    const agent = db.agentProfiles.get(listing.agentId);
    const media = db.listingMedia.get(listing.id) || [];
    const campus = db.campuses.get(listing.campusId);

    return {
      ...listing,
      priceAnnualNaira: listing.priceAnnualKobo / 100,
      campus: campus
        ? {
            id: campus.id,
            name: campus.name,
            shortCode: campus.shortCode,
          }
        : null,
      media,
      agent: agent
        ? {
            id: agent.id,
            name: agent.fullName,
            agencyName: agent.agencyName,
            trustTier: agent.trustTier,
            trustScore: agent.trustScore,
            responseRatePct: agent.responseRatePct,
            noShowCount: agent.noShowCount,
            totalInspections: agent.totalInspections,
          }
        : null,
    };
  }

  /**
   * Fast Agent Listing Creation:
   * Decoupled visibility invariant: Goes live immediately as 'unverified_new'.
   */
  public async createListing(agentId: string, input: CreateListingInput): Promise<Listing> {
    const agent = db.agentProfiles.get(agentId);
    if (!agent) {
      throw new Error(`Unauthorized or invalid agent profile: ${agentId}`);
    }

    const campus = db.campuses.get(input.campusId);
    if (!campus) {
      throw new Error(`Campus not supported: ${input.campusId}`);
    }

    const listingId = uuidv4();
    const priceAnnualKobo = Math.round(input.priceAnnualNaira * 100);
    const priceMonthlyKobo = input.priceMonthlyNaira ? Math.round(input.priceMonthlyNaira * 100) : undefined;

    const newListing: Listing = {
      id: listingId,
      agentId,
      campusId: input.campusId,
      title: input.title,
      description: input.description,
      roomType: input.roomType,
      priceAnnualKobo,
      priceMonthlyKobo,
      landmarkVicinity: input.landmarkVicinity,
      moveInDate: new Date(input.moveInDate),
      availabilityStatus: 'available',
      verificationStatus: 'unverified_new', // Core Invariant: Immediately live as unverified
      isBoosted: false,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.listings.set(listingId, newListing);

    // Save photos
    if (input.photos && input.photos.length > 0) {
      const mediaList = input.photos.map((p, idx) => ({
        id: uuidv4(),
        listingId,
        mediaUrl: p.url,
        mediaType: 'image' as const,
        isLiveUpload: !!p.isLiveUpload,
        exifGeoMetadata: p.exifGeoMetadata,
        sortOrder: idx,
      }));
      db.listingMedia.set(listingId, mediaList);

      // Fast-track verification if live-upload with GPS is provided
      const hasLiveGeotag = input.photos.some((p) => p.isLiveUpload && p.exifGeoMetadata);
      if (hasLiveGeotag && agent.trustTier === 'gold') {
        newListing.verificationStatus = 'verified';
      }
    }

    db.recordAudit('listing', listingId, 'CREATE_LISTING', agent.userId, undefined, {
      title: newListing.title,
      verificationStatus: newListing.verificationStatus,
    });

    return newListing;
  }

  /**
   * Single-tap availability toggle: 'available' | 'held' | 'taken'
   */
  public async updateAvailability(
    listingId: string,
    actorUserId: string,
    newStatus: AvailabilityStatus,
    reason?: string
  ): Promise<Listing> {
    const listing = db.listings.get(listingId);
    if (!listing) {
      throw new Error(`Listing not found: ${listingId}`);
    }

    const agent = db.agentProfiles.get(listing.agentId);
    if (!agent || agent.userId !== actorUserId) {
      // Check if actor is admin
      const actorUser = db.users.get(actorUserId);
      if (!actorUser || actorUser.userType !== 'admin') {
        throw new Error('Unauthorized to modify availability for this listing.');
      }
    }

    const oldStatus = listing.availabilityStatus;
    listing.availabilityStatus = newStatus;
    listing.updatedAt = new Date();

    db.recordAudit('listing', listingId, 'UPDATE_AVAILABILITY', actorUserId, { status: oldStatus }, { status: newStatus, reason });

    return listing;
  }

  /**
   * Request verification upgrade / spot-check
   */
  public async requestVerification(listingId: string, actorUserId: string) {
    const listing = db.listings.get(listingId);
    if (!listing) {
      throw new Error(`Listing not found: ${listingId}`);
    }

    if (listing.verificationStatus === 'verified') {
      return { message: 'Listing is already verified.', status: 'verified' };
    }

    listing.verificationStatus = 'pending_inspection';
    listing.updatedAt = new Date();

    db.recordAudit('listing', listingId, 'REQUEST_VERIFICATION', actorUserId, undefined, {
      status: 'pending_inspection',
    });

    return { message: 'Listing queued for student physical spot-check.', status: 'pending_inspection' };
  }
}

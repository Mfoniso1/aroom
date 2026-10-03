// ==============================================================================
// Aroom: In-Memory / Relational Store Layer
// Emulates the PostgreSQL schema with composite indexes and transactions.
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import {
  User,
  StudentProfile,
  AgentProfile,
  Campus,
  Listing,
  ListingMedia,
  Inquiry,
  AvailabilityReport,
  InspectionReview,
  ConversationSession,
  AuditLog,
} from '../domain/entities/types.js';

export class DatabaseStore {
  public users: Map<string, User> = new Map();
  public studentProfiles: Map<string, StudentProfile> = new Map();
  public agentProfiles: Map<string, AgentProfile> = new Map();
  public campuses: Map<string, Campus> = new Map();
  public listings: Map<string, Listing> = new Map();
  public listingMedia: Map<string, ListingMedia[]> = new Map();
  public inquiries: Map<string, Inquiry> = new Map();
  public availabilityReports: Map<string, AvailabilityReport> = new Map();
  public inspectionReviews: Map<string, InspectionReview> = new Map();
  public conversationSessions: Map<string, ConversationSession> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedPilotData();
  }

  public recordAudit(
    entityName: string,
    entityId: string,
    actionType: string,
    actorId?: string,
    stateBefore?: Record<string, any>,
    stateAfter?: Record<string, any>
  ) {
    this.auditLogs.push({
      id: uuidv4(),
      entityName,
      entityId,
      actorId,
      actionType,
      stateBefore,
      stateAfter,
      createdAt: new Date(),
    });
  }

  private seedPilotData() {
    // 1. Campus: UNILAG
    const unilagId = 'c1111111-1111-1111-1111-111111111111';
    this.campuses.set(unilagId, {
      id: unilagId,
      name: 'University of Lagos',
      shortCode: 'UNILAG',
      city: 'Yaba, Lagos',
      state: 'Lagos State',
      institutionalEmailDomains: ['@live.unilag.edu.ng', '@unilag.edu.ng'],
      geographicBoundaries: {
        center: [6.5181, 3.3995],
        radiusKm: 4.5,
        popularLandmarks: ['Akoka Gate', 'Abule Oja', 'Onike', 'Bariga', 'St. Finbarrs', 'Yaba Tech Junction'],
      },
      createdAt: new Date(),
    });

    // 2. Agents
    // Agent 1: Femi Ogundipe (Gold Tier, 98% response)
    const femiUserId = 'u1111111-1111-1111-1111-111111111111';
    const femiAgentId = 'a1111111-1111-1111-1111-111111111111';
    this.users.set(femiUserId, {
      id: femiUserId,
      phoneNumber: '+2348011112222',
      email: 'femi.ogundipe@aroomagents.ng',
      userType: 'agent',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.agentProfiles.set(femiAgentId, {
      id: femiAgentId,
      userId: femiUserId,
      fullName: 'Femi Ogundipe',
      agencyName: 'Akoka Campus Homes Ltd',
      idCardImageUrl: 'https://cdn.aroom.ng/agents/ids/femi_verified_nin.jpg',
      isPhoneVerified: true,
      trustTier: 'gold',
      trustScore: 96.5,
      totalInspections: 42,
      successfulDeals: 38,
      noShowCount: 0,
      responseRatePct: 98.0,
      createdAt: new Date(),
    });

    // Agent 2: Chinedu Eze (Silver Tier)
    const chineduUserId = 'u2222222-2222-2222-2222-222222222222';
    const chineduAgentId = 'a2222222-2222-2222-2222-222222222222';
    this.users.set(chineduUserId, {
      id: chineduUserId,
      phoneNumber: '+2348033334444',
      email: 'chinedu.eze@yabahouses.ng',
      userType: 'agent',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.agentProfiles.set(chineduAgentId, {
      id: chineduAgentId,
      userId: chineduUserId,
      fullName: 'Chinedu Eze',
      agencyName: 'Lagoon View Realty',
      idCardImageUrl: 'https://cdn.aroom.ng/agents/ids/chinedu_id.jpg',
      isPhoneVerified: true,
      trustTier: 'silver',
      trustScore: 82.0,
      totalInspections: 18,
      successfulDeals: 14,
      noShowCount: 1,
      responseRatePct: 91.5,
      createdAt: new Date(),
    });

    // 3. Students
    // Student 1: Verified UNILAG Student
    const student1UserId = 'u3333333-3333-3333-3333-333333333333';
    this.users.set(student1UserId, {
      id: student1UserId,
      phoneNumber: '+2348055556666',
      email: 'c.okeke@live.unilag.edu.ng',
      userType: 'student',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.studentProfiles.set('s1111111-1111-1111-1111-111111111111', {
      id: 's1111111-1111-1111-1111-111111111111',
      userId: student1UserId,
      campusId: unilagId,
      matricNumber: '190404012',
      institutionalEmail: 'c.okeke@live.unilag.edu.ng',
      isInstitutionVerified: true,
      verifiedAt: new Date(),
    });

    // 4. Initial Seed Listings
    // Listing 1: Verified Self-Contain at Akoka Gate
    const listing1Id = 'l1111111-1111-1111-1111-111111111111';
    this.listings.set(listing1Id, {
      id: listing1Id,
      agentId: femiAgentId,
      campusId: unilagId,
      title: 'Standard Executive Self-Contain (Serviced water + prepaid meter)',
      description: 'Well ventilated studio room with personal kitchen, tiled bathroom, running borehole water, and dedicated prepaid electric meter. 5 minutes walk to UNILAG gate.',
      roomType: 'self_contain',
      priceAnnualKobo: 35000000, // ₦350,000 / yr
      priceMonthlyKobo: undefined,
      landmarkVicinity: 'Akoka Gate (5 mins walk)',
      moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      availabilityStatus: 'available',
      verificationStatus: 'verified',
      isBoosted: true,
      boostedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      viewCount: 148,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.listingMedia.set(listing1Id, [
      {
        id: uuidv4(),
        listingId: listing1Id,
        mediaUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        mediaType: 'image',
        isLiveUpload: true,
        sortOrder: 0,
      },
      {
        id: uuidv4(),
        listingId: listing1Id,
        mediaUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        mediaType: 'image',
        isLiveUpload: false,
        sortOrder: 1,
      },
    ]);

    // Listing 2: Unverified - New Single Room at Abule Oja
    const listing2Id = 'l2222222-2222-2222-2222-222222222222';
    this.listings.set(listing2Id, {
      id: listing2Id,
      agentId: chineduAgentId,
      campusId: unilagId,
      title: 'Budget Single Room in Abule Oja',
      description: 'Decent single room in a clean shared compound. Shared clean bathroom. Gated compound with 24/7 security guard.',
      roomType: 'single_room',
      priceAnnualKobo: 18000000, // ₦180,000 / yr
      priceMonthlyKobo: undefined,
      landmarkVicinity: 'Abule Oja Junction',
      moveInDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      availabilityStatus: 'available',
      verificationStatus: 'unverified_new',
      isBoosted: false,
      viewCount: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.listingMedia.set(listing2Id, [
      {
        id: uuidv4(),
        listingId: listing2Id,
        mediaUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
        mediaType: 'image',
        isLiveUpload: false,
        sortOrder: 0,
      },
    ]);

    // Listing 3: Held / Under Inspection Room in Onike
    const listing3Id = 'l3333333-3333-3333-3333-333333333333';
    this.listings.set(listing3Id, {
      id: listing3Id,
      agentId: femiAgentId,
      campusId: unilagId,
      title: 'Modern Shared 2-Bedroom Flat in Onike',
      description: 'Spacious room in a 2-bedroom flat with parlour and kitchen. In high demand. Inspection currently booked.',
      roomType: 'flat_shared',
      priceAnnualKobo: 28000000, // ₦280,000 / yr
      landmarkVicinity: 'Onike Roundabout',
      moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      availabilityStatus: 'held',
      verificationStatus: 'verified',
      isBoosted: false,
      viewCount: 89,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// Global Singleton Instance
export const db = new DatabaseStore();

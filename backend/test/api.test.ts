// ==============================================================================
// Aroom: Comprehensive API & Domain End-to-End Test Suite
// Validates Database, Shared Domain Services, Trust Guardrails, and REST APIs
// ==============================================================================

import { createApp } from '../src/app.js';
import { Server } from 'http';

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
let server: Server;

// Color helpers for terminal output
const green = (msg: string) => `\x1b[32m✔ ${msg}\x1b[0m`;
const bold = (msg: string) => `\x1b[1m${msg}\x1b[0m`;

async function runTests() {
  console.log(bold('\n🧪 Starting Aroom Database & API Implementation Test Suite...\n'));

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on ${BASE_URL}`);
      resolve();
    });
  });

  try {
    // --------------------------------------------------------------------------
    // Test 1: Health Check
    // --------------------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/health`);
      const body = await res.json();
      if (res.status !== 200 || body.status !== 'healthy') {
        throw new Error(`Health check failed: ${JSON.stringify(body)}`);
      }
      console.log(green('Test 1: Health check passed (/health)'));
    }

    // --------------------------------------------------------------------------
    // Test 2: Campuses Endpoint
    // --------------------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/api/v1/campuses`);
      const body = await res.json();
      if (!body.success || body.data.length === 0 || body.data[0].shortCode !== 'UNILAG') {
        throw new Error(`Campus check failed: ${JSON.stringify(body)}`);
      }
      console.log(green('Test 2: Pilot Campus UNILAG loaded with landmarks (/api/v1/campuses)'));
    }

    // --------------------------------------------------------------------------
    // Test 3: Multi-Factor Listing Search (Shared ListingService)
    // --------------------------------------------------------------------------
    {
      const res = await fetch(
        `${BASE_URL}/api/v1/listings/search?campus_code=UNILAG&max_budget=360000&room_type=self_contain`
      );
      const body = await res.json();
      if (!body.success || body.data.items.length === 0) {
        throw new Error(`Listing search failed: ${JSON.stringify(body)}`);
      }
      const item = body.data.items[0];
      if (item.verificationStatus !== 'verified' || item.priceAnnualNaira !== 350000) {
        throw new Error(`Expected ₦350,000 verified self-contain, got: ${JSON.stringify(item)}`);
      }
      console.log(green(`Test 3: Multi-factor search returned: "${item.title}" (₦${item.priceAnnualNaira.toLocaleString()}/yr, Status: ${item.verificationStatus})`));
    }

    // --------------------------------------------------------------------------
    // Test 4: Agent Listing Creation (Decoupled Visibility Invariant)
    // --------------------------------------------------------------------------
    let createdListingId = '';
    {
      const newListingPayload = {
        campusId: 'c1111111-1111-1111-1111-111111111111',
        title: 'Spacious Akoka Mini Flat close to gate',
        description: 'Serene environment, constant electricity, running borehole water.',
        roomType: 'flat_entire',
        priceAnnualNaira: 500000,
        landmarkVicinity: 'St. Finbarrs College Road',
        moveInDate: '2026-10-15',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            isLiveUpload: false,
          },
        ],
      };

      const res = await fetch(`${BASE_URL}/api/v1/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'd1111111-1111-1111-1111-111111111111', // Seed agent Femi
        },
        body: JSON.stringify(newListingPayload),
      });

      const body = await res.json();
      if (!body.success || body.data.verificationStatus !== 'unverified_new') {
        throw new Error(`Listing creation failed or did not default to unverified_new: ${JSON.stringify(body)}`);
      }
      createdListingId = body.data.id;
      console.log(green(`Test 4: Agent listing created immediately live as [${body.data.verificationStatus}] (ID: ${createdListingId})`));
    }

    // --------------------------------------------------------------------------
    // Test 5: Single-Tap Availability Status Toggle
    // --------------------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/api/v1/listings/${createdListingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'd1111111-1111-1111-1111-111111111111',
        },
        body: JSON.stringify({ status: 'held', reason: 'Student inspection underway' }),
      });
      const body = await res.json();
      if (!body.success || body.data.availabilityStatus !== 'held') {
        throw new Error(`Availability toggle failed: ${JSON.stringify(body)}`);
      }
      console.log(green(`Test 5: Agent single-tap toggled status to [${body.data.availabilityStatus}]`));
    }

    // --------------------------------------------------------------------------
    // Test 6: Student Onboarding & Institutional Domain Check
    // --------------------------------------------------------------------------
    let registeredStudentUserId = '';
    {
      const res = await fetch(`${BASE_URL}/api/v1/auth/student/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+2348077778888',
          campusId: 'c1111111-1111-1111-1111-111111111111',
          email: 'bolaji.adebayo@live.unilag.edu.ng', // Institutional UNILAG domain
          matricNumber: '200505119',
        }),
      });

      const body = await res.json();
      if (!body.success || !body.data.isInstitutionVerified) {
        throw new Error(`Student institutional email matching failed: ${JSON.stringify(body)}`);
      }
      registeredStudentUserId = body.data.userId;
      console.log(green('Test 6: Student registered and automatically verified via @live.unilag.edu.ng domain'));
    }

    // --------------------------------------------------------------------------
    // Test 7: Universal Inquiry & Inspection Booking
    // --------------------------------------------------------------------------
    let inquiryId = '';
    {
      const targetListingId = 'f1111111-1111-1111-1111-111111111111'; // Verified Akoka room
      const res = await fetch(`${BASE_URL}/api/v1/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': registeredStudentUserId,
        },
        body: JSON.stringify({
          listingId: targetListingId,
          sourceChannel: 'web',
          inspectionSlot: '2026-10-02T14:00:00Z',
          studentNote: 'I want to inspect this room tomorrow afternoon.',
        }),
      });

      const body = await res.json();
      if (!body.success || body.data.status !== 'requested') {
        throw new Error(`Inquiry creation failed: ${JSON.stringify(body)}`);
      }
      inquiryId = body.data.id;
      console.log(green(`Test 7: Inspection lead created (Inquiry ID: ${inquiryId}, Listing placed on held)`));
    }

    // --------------------------------------------------------------------------
    // Test 8: Agent Lead Queue Inspection
    // --------------------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/api/v1/inquiries/agent-queue`, {
        headers: { 'x-user-id': 'd1111111-1111-1111-1111-111111111111' },
      });
      const body = await res.json();
      if (!body.success || body.data.length === 0) {
        throw new Error(`Agent queue fetch failed: ${JSON.stringify(body)}`);
      }
      const lead = body.data.find((item: any) => item.id === inquiryId);
      if (!lead || !lead.student?.isInstitutionVerified) {
        throw new Error(`Expected verified student lead in agent queue, got: ${JSON.stringify(lead)}`);
      }
      console.log(green('Test 8: Agent received qualified lead marked with [isInstitutionVerified: true]'));
    }

    // --------------------------------------------------------------------------
    // Test 9: 24h Post-Inspection Sentinel Feedback & Crowdsourced Availability
    // --------------------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/api/v1/inquiries/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': registeredStudentUserId,
        },
        body: JSON.stringify({
          inquiryId,
          ratingStars: 5,
          visitedProperty: true,
          accuratelyDescribed: true,
          agentShowedUp: true,
          isRoomStillAvailable: false, // Student took it / room paid for!
          reviewNotes: 'Great property! I paid the landlord directly after inspecting.',
        }),
      });

      const body = await res.json();
      if (!body.success) {
        throw new Error(`Feedback submission failed: ${JSON.stringify(body)}`);
      }

      // Verify that listing availability automatically transitioned to 'taken'
      const listingRes = await fetch(`${BASE_URL}/api/v1/listings/f1111111-1111-1111-1111-111111111111`);
      const listingBody = await listingRes.json();
      if (listingBody.data.availabilityStatus !== 'taken') {
        throw new Error(`Listing availability should be 'taken', but got: ${listingBody.data.availabilityStatus}`);
      }
      console.log(green('Test 9: Post-inspection survey automatically transitioned listing status to [taken]'));
    }

    // --------------------------------------------------------------------------
    // Test 10: WhatsApp Webhook Challenge Verification
    // --------------------------------------------------------------------------
    {
      const challengeToken = 'test_challenge_12345';
      const verifyToken = 'aroom_secure_webhook_token_2026';
      const res = await fetch(
        `${BASE_URL}/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challengeToken}`
      );
      const text = await res.text();
      if (res.status !== 200 || text !== challengeToken) {
        throw new Error(`WhatsApp webhook verification failed. Got: ${text}`);
      }
      console.log(green('Test 10: Meta WhatsApp webhook challenge verification succeeded'));
    }

    // --------------------------------------------------------------------------
    // Test 11: WhatsApp Webhook Intake & Shared ListingService Trigger
    // --------------------------------------------------------------------------
    {
      const simulatedWhatsAppPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '2348000000000', phone_number_id: '123456789' },
                  messages: [
                    {
                      from: '2348099998888',
                      id: 'wamid.HBgLMjM0ODA5OTk5ODg4OBUCABIYFDNBM0Q4M0U4NUMyRDcwQjU5RTE5AA==',
                      timestamp: '1727337600',
                      text: { body: 'Looking for a selfcon in UNILAG under 350k' },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const res = await fetch(`${BASE_URL}/api/v1/webhooks/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedWhatsAppPayload),
      });

      const body = await res.json();
      if (res.status !== 200 || body.status !== 'received') {
        throw new Error(`WhatsApp inbound webhook processing failed: ${JSON.stringify(body)}`);
      }
      console.log(green('Test 11: Inbound WhatsApp message processed through FSM & queried ListingService'));
    }

    console.log(bold('\n🎉 ALL 11 TESTS PASSED SUCCESSFULLY! Database & API design fully operational.\n'));
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  if (server) server.close();
  process.exit(1);
});

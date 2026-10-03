import { Router, Request, Response } from 'express';
import { ListingService } from '../../domain/services/listing.service.js';
import { InquiryService } from '../../domain/services/inquiry.service.js';
import { db } from '../../db/store.js';
import { v4 as uuidv4 } from 'uuid';

export const webhookRouter = Router();
const listingService = new ListingService();
const inquiryService = new InquiryService();

// In-memory set for deduplicating incoming WhatsApp messages
const processedMessageIds = new Set<string>();

/**
 * GET /api/v1/webhooks/whatsapp
 * Meta WhatsApp Cloud API Webhook Challenge Verification
 */
webhookRouter.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const EXPECTED_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'aroom_secure_webhook_token_2026';

  if (mode === 'subscribe' && token === EXPECTED_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification token mismatch');
  }
});

/**
 * POST /api/v1/webhooks/whatsapp
 * Inbound WhatsApp webhook ingestion with state machine dispatch
 */
webhookRouter.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Acknowledge receipt to Meta immediately (200 OK)
    res.status(200).json({ status: 'received' });

    // Validate payload shape
    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return;
    }

    const messageId = message.id;
    if (processedMessageIds.has(messageId)) {
      // Duplicate delivery from Meta; ignore
      return;
    }
    processedMessageIds.add(messageId);

    const fromPhone = message.from; // Sender WhatsApp phone number
    const messageText = message.text?.body || message.interactive?.button_reply?.title || '';

    // Retrieve or initialize conversation session in DB
    let session = Array.from(db.conversationSessions.values()).find((s) => s.whatsappPhone === fromPhone);
    if (!session) {
      const sessionId = uuidv4();
      session = {
        id: sessionId,
        whatsappPhone: fromPhone,
        currentState: 'START',
        contextSlots: {},
        lastInteractionAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hr TTL
      };
      db.conversationSessions.set(sessionId, session);
    }

    // Process Message through FSM and invoke shared domain services
    await handleWhatsAppTurn(session, messageText);
  } catch (error) {
    console.error('Error processing WhatsApp webhook event:', error);
  }
});

/**
 * Deterministic FSM Turn Handler
 */
async function handleWhatsAppTurn(session: any, text: string) {
  const cleanText = text.trim().toLowerCase();
  session.lastInteractionAt = new Date();

  // Keyword extraction for rent and room type
  if (cleanText.includes('unilag') || cleanText.includes('lagos')) {
    session.contextSlots.campusShortCode = 'UNILAG';
  }

  // Regex parse budget: e.g. "350k", "300k"
  const budgetMatch = cleanText.match(/(?:₦|n|ngn)?\s*(\d{2,4})\s*(?:k|thousand)/i);
  if (budgetMatch) {
    session.contextSlots.maxBudgetKobo = parseInt(budgetMatch[1], 10) * 1000 * 100;
  }

  // Room type match
  if (cleanText.includes('selfcon') || cleanText.includes('self contain') || cleanText.includes('studio')) {
    session.contextSlots.roomType = 'self_contain';
  } else if (cleanText.includes('single')) {
    session.contextSlots.roomType = 'single_room';
  } else if (cleanText.includes('shared') || cleanText.includes('flat')) {
    session.contextSlots.roomType = 'flat_shared';
  }

  // If we have campus and room type/budget, query Shared ListingService!
  if (session.contextSlots.campusShortCode) {
    const searchResults = await listingService.search({
      campusShortCode: session.contextSlots.campusShortCode,
      maxBudgetKobo: session.contextSlots.maxBudgetKobo,
      roomType: session.contextSlots.roomType,
      limit: 3,
    });

    // In a live environment, this compiles and sends WhatsApp interactive cards
    // Here we record the search execution in session context
    session.contextSlots.lastSearchResults = searchResults.items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.priceAnnualNaira,
      verificationStatus: i.verificationStatus,
    }));
    session.currentState = 'PRESENTING_RESULTS';
  }
}

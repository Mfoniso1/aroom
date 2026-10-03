// ==============================================================================
// Aroom: Zod Request Validation DTOs
// ==============================================================================

import { z } from 'zod';

export const SearchListingsQuerySchema = z.object({
  campus_id: z.string().optional(),
  campus_code: z.string().optional(),
  min_budget: z.coerce.number().positive().optional(),
  max_budget: z.coerce.number().positive().optional(),
  room_type: z.enum(['self_contain', 'single_room', 'flat_shared', 'flat_entire']).optional(),
  only_verified: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  status: z.enum(['available', 'held', 'taken']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CreateListingBodySchema = z.object({
  campusId: z.string().min(1),
  title: z.string().min(5).max(255),
  description: z.string().min(10),
  roomType: z.enum(['self_contain', 'single_room', 'flat_shared', 'flat_entire']),
  priceAnnualNaira: z.number().positive(),
  priceMonthlyNaira: z.number().positive().optional(),
  landmarkVicinity: z.string().min(3).max(255),
  moveInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid move-in date format' }),
  photos: z
    .array(
      z.object({
        url: z.string().url(),
        isLiveUpload: z.boolean().optional(),
        exifGeoMetadata: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            timestamp: z.string(),
          })
          .optional(),
      })
    )
    .optional(),
});

export const UpdateListingStatusSchema = z.object({
  status: z.enum(['available', 'held', 'taken']),
  reason: z.string().optional(),
});

export const CreateInquiryBodySchema = z.object({
  listingId: z.string().min(1),
  sourceChannel: z.enum(['whatsapp', 'web']).default('web'),
  inspectionSlot: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid inspection date' })
    .optional(),
  studentNote: z.string().max(500).optional(),
});

export const SubmitFeedbackBodySchema = z.object({
  inquiryId: z.string().min(1),
  ratingStars: z.number().int().min(1).max(5),
  visitedProperty: z.boolean(),
  accuratelyDescribed: z.boolean(),
  agentShowedUp: z.boolean(),
  isRoomStillAvailable: z.boolean(),
  reviewNotes: z.string().max(1000).optional(),
});

export const SubmitReportBodySchema = z.object({
  listingId: z.string().min(1),
  reportedStatus: z.enum(['available', 'held', 'taken']),
  comments: z.string().min(5).max(1000),
});

export const AgentSignupBodySchema = z.object({
  phoneNumber: z.string().min(10).max(20),
  fullName: z.string().min(2).max(255),
  agencyName: z.string().max(255).optional(),
  idCardImageUrl: z.string().url(),
});

export const VerifyOtpBodySchema = z.object({
  phoneNumber: z.string().min(10).max(20),
  otp: z.string().length(6),
});

export const StudentSignupBodySchema = z.object({
  phoneNumber: z.string().min(10).max(20),
  campusId: z.string().min(1),
  email: z.string().email().optional(),
  matricNumber: z.string().optional(),
  studentIdImageUrl: z.string().url().optional(),
});

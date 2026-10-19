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
  email: z.string().email().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  fullName: z.string().min(2).max(255),
  agentKind: z.enum(['agent', 'landlord']).default('agent'),
  agencyName: z.string().max(255).optional(),
  // Reference returned by POST /auth/upload-id (storage:// path, data URL or https URL)
  idCardImageUrl: z.string().min(5),
});

export const LoginBodySchema = z
  .object({
    // Phone number OR email address
    identifier: z.string().min(3).max(255).optional(),
    phoneNumber: z.string().min(3).max(255).optional(), // legacy alias of identifier
    password: z.string().min(1),
  })
  .refine((v) => v.identifier || v.phoneNumber, { message: 'Enter your phone number or email' })
  .transform((v) => ({ identifier: (v.identifier || v.phoneNumber)!, password: v.password }));

export const UploadIdBodySchema = z.object({
  contentType: z.string(),
  dataBase64: z.string().min(10),
});

export const RejectAgentBodySchema = z.object({
  reason: z.string().min(5, 'Please give the applicant a short reason').max(500),
});

export const ApproveAgentBodySchema = z.object({
  phoneContacted: z.boolean().optional(),
});

export const SuspendAgentBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export const PhoneContactedBodySchema = z.object({
  value: z.boolean(),
});

export const CreateApprovedAgentBodySchema = z.object({
  fullName: z.string().min(2).max(255),
  phoneNumber: z.string().min(10).max(20),
  password: z.string().min(8).max(100),
  agentKind: z.enum(['agent', 'landlord']).default('agent'),
  agencyName: z.string().max(255).optional(),
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

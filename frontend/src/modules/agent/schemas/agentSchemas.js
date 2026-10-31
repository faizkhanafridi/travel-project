import { z } from 'zod';

// Matches SaveAgencyInformationRequest
export const agencySchema = z.object({
  agency_name: z.string().min(2, 'At least 2 characters').max(150),
  agency_owner_name: z.string().min(2, 'At least 2 characters').max(150),
  phone: z
    .string()
    .max(30)
    .regex(/^\+?[0-9\s\-()]{6,30}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  country: z.string().min(1, 'Country is required').max(80),
  city: z.string().min(1, 'City is required').max(120),
  address: z.string().min(1, 'Address is required').max(500),
});

// Matches SaveBusinessInformationRequest
export const businessSchema = z.object({
  business_description: z
    .string()
    .min(50, 'At least 50 characters')
    .max(2000),
  years_in_business: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= 0 && n <= 100, {
      message: 'Enter a number between 0 and 100',
    }),
  business_type: z.string().min(1, 'Business type is required').max(80),
  registration_information: z.string().max(500).optional().or(z.literal('')),
  website: z
    .string()
    .max(200)
    .url('Enter a valid URL (https://…)')
    .optional()
    .or(z.literal('')),
  social_media: z.array(z.string().max(200)).max(10).optional().default([]),
  languages: z.array(z.string().max(60)).max(20).optional().default([]),
  specializations: z.array(z.string().max(60)).max(20).optional().default([]),
});

// Business hours: array of 7, one per day
export const businessHoursSchema = z.object({
  hours: z
    .array(
      z
        .object({
          day_of_week: z.number().int().min(0).max(6),
          is_closed: z.boolean(),
          open_time: z.string().nullable().optional(),
          close_time: z.string().nullable().optional(),
        })
        .refine(
          (h) =>
            h.is_closed ||
            (h.open_time && h.close_time && h.open_time < h.close_time),
          { message: 'Close time must be after open time' }
        )
    )
    .length(7),
});

// Document types
export const REQUIRED_DOCUMENT_TYPES = ['business_registration', 'license', 'identity'];
export const OPTIONAL_DOCUMENT_TYPES = ['other'];

export const DOCUMENT_LABELS = {
  business_registration: 'Business Registration',
  license: 'License',
  identity: 'Identity Document',
  other: 'Other Document',
};

export const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10MB
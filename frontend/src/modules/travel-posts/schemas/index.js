import { z } from 'zod';

export const DURATION_UNITS = ['days', 'hours', 'one-time'];

export const globalPostSchema = z.object({
  title: z.string().min(5, 'Minimum 5 characters').max(150, 'Maximum 150 characters'),
  description: z.string().min(300, 'Minimum 300 characters').max(1200, 'Maximum 1200 characters'),
  category_id: z.number().int().positive('Select a category'),
  subcategory_id: z.number().int().positive('Select a subcategory'),
  duration: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 365, { message: 'Duration must be between 1 and 365' }),
  duration_unit: z.enum(DURATION_UNITS),
  destination_country: z.string().min(1, 'Country is required').max(80),
  destination_city: z.string().min(1, 'City is required').max(80),
  travel_date: z.string().optional().or(z.literal('')),
  travelers_total: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 50, { message: 'Between 1 and 50' }),
  travelers_adults: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 50, { message: 'Between 1 and 50' }),
  travelers_children: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 0 && v <= 50, { message: 'Between 0 and 50' }),
  budget_min: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined || v === null ? undefined : Number(v))),
  budget_max: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined || v === null ? undefined : Number(v))),
  services_needed: z.array(z.string().max(120)).max(20).optional(),
  additional_requirements: z.string().max(2000).optional().or(z.literal('')),
});

export const serviceTripRequestSchema = z.object({
  description: z.string().min(300, 'Minimum 300 characters').max(1200, 'Maximum 1200 characters'),
  preferred_date: z.string().min(1, 'Preferred date is required'),
  duration: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 365, { message: 'Duration must be between 1 and 365' }),
  duration_unit: z.enum(DURATION_UNITS),
  travelers_total: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 50),
  travelers_adults: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 50),
  travelers_children: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 0 && v <= 50),
  budget_min: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined || v === null ? undefined : Number(v))),
  budget_max: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined || v === null ? undefined : Number(v))),
  additional_requirements: z.string().max(2000).optional().or(z.literal('')),
});

export const offerRequirementSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  answer_type: z.enum(['text', 'textarea', 'file', 'number', 'date']),
});

export const submitOfferSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v >= 1, { message: 'Amount must be at least 1' }),
  duration: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 365),
  duration_unit: z.enum(DURATION_UNITS),
  message: z.string().min(20, 'Minimum 20 characters').max(2000),
  inclusions: z.array(z.string().max(200)).max(20).optional(),
  itinerary: z.string().max(5000).optional().or(z.literal('')),
  requirements: z.array(offerRequirementSchema).min(2, 'At least 2 requirements required').max(20),
});
import { z } from 'zod';

export const basicSchema = z.object({
  title: z.string().min(5, 'Minimum 5 characters').max(150, 'Maximum 150 characters'),
  category_id: z.number().int().positive('Select a category'),
  subcategory_id: z.number().int().positive('Select a subcategory'),
  tags: z
    .array(z.string().min(2, 'Min 2 characters').max(60))
    .min(3, 'At least 3 tags required')
    .max(20, 'Maximum 20 tags'),
});

export const DURATION_UNITS = ['days', 'hours', 'one-time'];

export const detailsSchema = z.object({
  short_description: z.string().max(500).optional().or(z.literal('')),
  full_description: z
    .string()
    .min(600, 'Minimum 600 characters')
    .max(2000, 'Maximum 2000 characters'),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v >= 1 && v <= 9999999, {
      message: 'Price must be between 1 and 9,999,999',
    }),
  destination_country: z.string().min(1, 'Country is required').max(80),
  destination_city: z.string().min(1, 'City is required').max(80),
  duration: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 3650, {
      message: 'Duration must be between 1 and 3650',
    }),
  duration_unit: z.enum(DURATION_UNITS),
  inclusions: z.array(z.string().min(2).max(200)).min(1, 'At least one inclusion required').max(30),
  extras: z
    .array(
      z.object({
        label: z.string().min(1, 'Label required').max(200),
        price: z
          .union([z.string(), z.number()])
          .transform((v) => Number(v))
          .refine((v) => Number.isFinite(v) && v >= 0, { message: 'Price must be ≥ 0' }),
        description: z.string().max(500).optional().or(z.literal('')),
      })
    )
    .max(20)
    .optional(),
  cancellation_policy: z.string().max(2000).optional().or(z.literal('')),
});

export const requirementSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  answer_type: z.enum(['text', 'textarea', 'file', 'number', 'date']),
  validation_config: z.any().optional(),
});

export const requirementsSchema = z.object({
  requirements: z.array(requirementSchema).min(1, 'At least one requirement').max(20),
});

export const republishSchema = z.object({
  reason: z.string().min(10, 'Minimum 10 characters').max(2000),
});

export const rejectReasonSchema = z.object({
  reason: z.string().min(5, 'Minimum 5 characters').max(2000),
});

export const COVER_MIN = { w: 600, h: 400 };
export const GALLERY_MIN = { w: 400, h: 300 };
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
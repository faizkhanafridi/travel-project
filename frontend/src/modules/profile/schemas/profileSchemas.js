import { z } from 'zod';

// Matches backend: /^[a-z0-9_]+$/ min:3 max:30
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be 30 characters or fewer')
  .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores');

// Matches backend: min:2 max:80
export const displayNameSchema = z
  .string()
  .min(2, 'Display name must be at least 2 characters')
  .max(80, 'Display name must be 80 characters or fewer');

// Matches backend: max:1000
export const bioSchema = z
  .string()
  .max(1000, 'Bio must be 1,000 characters or fewer')
  .optional()
  .or(z.literal(''));

// Matches backend: /^\+?[0-9\s\-()]{6,30}$/
export const phoneSchema = z
  .string()
  .max(30, 'Phone is too long')
  .regex(/^\+?[0-9\s\-()]{6,30}$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal(''));

// Matches backend: date, before today
export const dobSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || new Date(v) < new Date(), {
    message: 'Date of birth must be in the past',
  });

// Matches backend: max:500
export const addressSchema = z
  .string()
  .max(500, 'Address must be 500 characters or fewer')
  .optional()
  .or(z.literal(''));

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: displayNameSchema,
  bio: bioSchema,
  phone: phoneSchema,
  date_of_birth: dobSchema,
  address: addressSchema,
  language_ids: z.array(z.number().int()).optional().default([]),
});

// Matches backend mimes:jpg,jpeg,png,webp max:5120 KB
export const photoSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (f) => !f || ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
    'Only JPG, PNG, or WEBP images are allowed'
  )
  .refine(
    (f) => !f || f.size <= 5 * 1024 * 1024,
    'Image must be 5 MB or smaller'
  );

// Email change schemas
export const emailChangeInitiateSchema = z.object({
  new_email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const emailChangePasswordSchema = z.object({
  new_email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  current_password: z.string().min(1, 'Password is required'),
});

export const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'The code must be 6 digits')
    .regex(/^\d{6}$/, 'The code must be 6 digits'),
});
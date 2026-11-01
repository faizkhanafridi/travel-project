import { z } from "zod";

export const agencySchema = z.object({
  agency_name: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(120, "Maximum 120 characters"),
  agency_owner_name: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(120, "Maximum 120 characters"),
  agency_phone: z
    .string()
    .max(30, "Maximum 30 characters")
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  agency_country: z.string().min(1, "Country is required").max(80),
  agency_city: z.string().min(1, "City is required").max(80),
  agency_address: z.string().min(1, "Address is required").max(255),
});

export const businessSchema = z.object({
  business_description: z
    .string()
    .min(50, "Minimum 50 characters")
    .max(5000, "Maximum 5000 characters"),
  years_in_business: z
    .union([z.number(), z.string()])
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine(
      (v) => v !== undefined && Number.isInteger(v) && v >= 0 && v <= 200,
      {
        message: "Enter a number between 0 and 200",
      },
    ),
  business_type: z.string().min(1, "Business type is required").max(120),
  registration_number: z.string().max(120).optional().or(z.literal("")),
  website: z
    .string()
    .max(255)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\/.+\..+/.test(v), "Enter a valid URL"),
  social_media: z.array(z.string().max(255)).max(10).optional(),
  languages: z.array(z.string().max(60)).max(20).optional(),
  specializations: z.array(z.string().max(120)).max(20).optional(),
});

export const hoursRowSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_closed: z.boolean(),
    open_time: z.string().nullable().optional(),
    close_time: z.string().nullable().optional(),
  })
  .refine(
    (row) => {
      if (row.is_closed) return true;
      if (!row.open_time || !row.close_time) return false;
      return row.close_time > row.open_time;
    },
    { message: "Close time must be after open time", path: ["close_time"] },
  );

export const hoursSchema = z.object({
  hours: z.array(hoursRowSchema).min(1).max(7),
});

export const rejectReasonSchema = z.object({
  reason: z
    .string()
    .min(5, "Minimum 5 characters")
    .max(2000, "Maximum 2000 characters"),
});

export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

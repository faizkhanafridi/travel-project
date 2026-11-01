import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(100, "Maximum 100 characters"),
  username: z
    .string()
    .min(3, "Minimum 3 characters")
    .max(30, "Maximum 30 characters")
    .regex(/^[a-zA-Z0-9_.]+$/, "Only letters, numbers, underscore, dot"),
  bio: z
    .string()
    .min(20, "Minimum 20 characters")
    .max(1000, "Maximum 1000 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(30, "Maximum 30 characters")
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  address_line: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
  languages: z.array(z.string().max(60)).max(20).optional(),
});

export const startEmailChangeSchema = z.object({
  new_email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
});

export const startEmailChangeWithPasswordSchema = z.object({
  new_email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  current_password: z.string().min(1, "Password is required"),
});

export const emailCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

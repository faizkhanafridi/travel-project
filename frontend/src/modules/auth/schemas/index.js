import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol');

const email = z.string().min(1, 'Email is required').email('Enter a valid email');
const code = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255),
    email,
    password: strongPassword,
    password_confirmation: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const verifyEmailSchema = z.object({ email, code });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    email,
    code,
    password: strongPassword,
    password_confirmation: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export const setPasswordSchema = resetPasswordSchema;

export const mfaVerifySchema = z.object({ code });

export const chooseRoleSchema = z.object({
  choice: z.enum(['customer', 'agent']),
});
import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password is too long'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export const verifyEmailSchema = z.object({
  email: z.string().email('Enter a valid email'),
  code: z
    .string()
    .length(6, 'The verification code must be 6 digits')
    .regex(/^\d{6}$/, 'The verification code must be 6 digits'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export const chooseRoleSchema = z.object({
  account_type: z.enum(['customer', 'agent'], {
    errorMap: () => ({ message: 'Choose an account type' }),
  }),
});
import { z } from 'zod';

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(12),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6).max(12),
    role: z.enum(['admin', 'manager', 'agent', 'customer']).default('customer').optional(),
  }),
});

export const refreshTokenSchema = z.object({
  cookies: z.object({
    refresh_token: z.string(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      current_password: z.string().min(6).max(12),
      new_password: z.string().min(6).max(12),
    })
    .refine((value) => value.current_password !== value.new_password, {
      message: 'New password must be unique',
    }),
});

export const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(12),
  }),
});

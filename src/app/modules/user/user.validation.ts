import { z } from 'zod';

export const userSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6).max(12),
    role: z
      .enum(['admin', 'manager', 'agent', 'customer'])
      .default('customer')
      .optional(),
    status: z.enum(['active', 'blocked']).default('active').optional(),
    is_deleted: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: userSchema.shape.body.partial(),
});

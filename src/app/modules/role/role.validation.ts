import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
});

export const assignPermissionsSchema = z.object({
  body: z.object({
    role_id: z.number(),
    permission_ids: z.array(z.number()),
  }),
});

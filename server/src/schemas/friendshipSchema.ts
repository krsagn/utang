import { z } from 'zod';

// validate username only, controller handles the rest
export const addFriendSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric only'),
});

// no reject status, since that just implies deletion
export const acceptFriendSchema = z.object({
  status: z.enum(['accepted']),
});

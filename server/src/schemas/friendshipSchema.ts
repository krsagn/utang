import { z } from 'zod';

// validate username only, controller handles the rest
export const addFriendSchema = z.object({
  id: z.string().uuid().min(1, 'Friend ID is required'),
});

// no reject status, since that just implies deletion
export const acceptFriendSchema = z.object({
  status: z.enum(['accepted']),
});

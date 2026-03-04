import { z } from 'zod';

// validate username only, controller handles the rest
export const addFriendSchema = z.object({
  id: z.string().uuid().min(1, 'Friend ID is required'),
});

import { z } from 'zod';

// Define the shape of the incoming request body (POST)
export const createDebtSchema = z.object({
  // parties involved
  lenderId: z.string().uuid().optional(),
  lendeeId: z.string().uuid().optional(),
  lenderName: z.string().min(1, 'Lender name is required'),
  lendeeName: z.string().min(1, 'Lendee name is required'),

  // Lent amount must be positive
  currency: z.string().length(3).toUpperCase(),
  amount: z.coerce.number().positive(),

  // Description is optional
  title: z.string().min(1, 'Title is required').max(30, 'Title too long'),
  description: z.string().max(100, 'Description too long').optional(),

  // Deadline is optional
  deadline: z.coerce.date().optional(),
});

// Same shape as createDebtSchema, partial() makes all fields optional
export const updateDebtSchema = createDebtSchema.partial().extend({
  status: z.enum(['pending', 'paid', 'void']).optional(),
});
